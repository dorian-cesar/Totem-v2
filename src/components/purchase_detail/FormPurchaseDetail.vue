<template>
  <div class="pt-3">
    <div class="transparent-main card-custon">
      <top-header-caption caption="DETALLE DE COMPRA" class="pt-3" />
      <personal-information v-bind="propsPersonalInformation" />
      <!-- pantalla modal -->
      <payment-control
        v-bind="propsPaymentControl"
        @nameAction="nameActionModal = $event"
      />
    </div>
    <!-- toolbar button-->
    <tool-bar-button-new3
      v-bind="propsToolbarButton"
      @nameButton="eventClick"
    />
  </div>
</template>


<script>
import TopHeaderCaption from "@/components/TopHeaderCaption";
import PersonalInformation from "@/components/purchase_detail/PersonalInformation";
import ToolBarButtonNew3 from "@/components/ToolbarButtonNew3";
import { mapGetters } from "vuex";
import webSocket from "@/mixins/websocket.js";
import PaymentControl from "@/components/purchase_detail/PaymentControl";
import reserveOrReleaseSeat from "@/mixins/reserveOrReleaseSeat";

export default {
  name: "FormEnterRut",

  mixins: [webSocket, reserveOrReleaseSeat],

  data() {
    return {
      countModal: 1,
      //
      isErrorGuardarTransaccion: false,
      //isErrorPagarPOS:false,
      isErrorTerminarTransaccionPOS: false,
      //
      timeChangeEstatus: false, // <- Prueba
      timeClose: null, // <- tiempo de espera para cerrar la pantalla de pago e ir a HOME
      //
      valuePOS: 0,
      ballotNumberPOS: "",
      //
      loadingGuardarTransaccion: false,
      loadingTerminarTransaccionPOS: false,
      //
      nameActionModal: "",
      status: false,
      link: "./payamount",
      total: "0",
      //
      propsToolbarButton: {
        lbLabel: "ANULAR",
        rbLabel: "PAGAR",
        rbIsDisable: false,
      },
      propsPersonalInformation: {
        tickets: [],
        total: "",
      },
      propsPaymentControl: {
        total: "",
        isChangeStatus: false,
        msg: "No se puede Realizar el pago!",
      },
      nameButton: "",
      transaccionPOS: "",
      ticketsGenerados: "",
      //
      isCheckOutService: false, //<- Chequeo de isOutService completado
    };
  },

  components: {
    PersonalInformation,
    TopHeaderCaption,
    ToolBarButtonNew3,
    PaymentControl,
  },

  methods: {
    ...mapGetters("BusSelection", ["getTravelBus"]),
    //calcular el total del monto
    calculateTotal() {
      let total = 0;

      for (let ticket of this.propsPersonalInformation.tickets) {
        total += parseFloat(ticket.price) * 1000;
      }

      total = Intl.NumberFormat("es-ES").format(total);
      this.propsPersonalInformation.total = total;
      this.propsPaymentControl.total = total;
      this.setTotalAmount = total;
    },
    //inicio del proceso de pago
    pagar() {
      console.log("- methods:pagar", this.propsPersonalInformation.tickets)
      console.log(
        "- methods:pagar",
        "! Fijar el tiempo de espera con setTimeout 150*1000",
        "-> checkStatusConn"
      );
      this.$bvModal.show("modal-payment-control"); //<- Pantalla modal de espera
      clearTimeout(this.timeClose); //<- Borrar variable de tiempo de espera
      this.timeChangeEstatus = false; //<- Variable de estado del vencimiento del tiempo de espera
      this.timeClose = setTimeout(
        function () {
          this.timeChangeEstatus = true; //<- Se acabó el tiempo
        }.bind(this),
        150 * 1000
      ); // <- 100 segundos Tiempo máximo de espera para cambiar el estado del modal

      // Comprobar los errores de POS, impresora e internet (3)
      this.checkStatusConn(); // -> watch errorWebSocket (4)
    },
    //guardar transacción en la API de Pullman (1)
    saveTransaction: async function () {
      this.loadingGuardarTransaccion = true
      console.log('- methods:saveTransaction', 'loadingGuardarTransaccion = ' + this.loadingGuardarTransaccion)

      const proxy = URL_PROXY
      const api = 'integrador-web/rest/pago/guardarTransaccion'
      const listaCarrito = []

      // Asignar los tickets para ser enviados en los parámetros de la API
      for (let ticket of this.propsPersonalInformation.tickets) {
        const itemCarrito = {
          fechaPasada: ticket.fechaServicio,
          asiento: ticket.asiento,
          clase: ticket.clase,
          servicio: ticket.servicio,
          fechaServicio: ticket.fechaServicio,
          horaSalida: ticket.horaSalida,
          origen: ticket.origen,
          destino: ticket.destino,
          monto: parseFloat(ticket.precio.replace('.', '')), // <- arreglar el número
          precio: parseFloat(ticket.precio.replace('.', '')), // <- arreglar el número
          empresa: ticket.empresa,
          bus: ticket.bus,
          piso: ticket.piso,
          integrador: ticket.integrador
        }
        if (ticket.codeReservation != null) {
          itemCarrito.codigoReserva = ticket.codeReservation
        }
        listaCarrito.push(itemCarrito)
      }

      // Parámetros del POST a la API de Pullman
      let param = {
        email: 'marco.betancourt@clamber.cl', // <- email de prueba
        rut: '1-9',
        medioDePago: "POS",
        puntoVenta: "POS01",
        montoTotal: parseFloat(this.propsPersonalInformation.total.replace('.', '')), // <- arreglar el número
        idSistema: 1,
        listaCarrito: listaCarrito
      }
      console.log('+ methods:saveTransaction', 'param {}', param)

      await this.axios
        .post([proxy, api].join('/'), param)
        .then(response => {
          this.transaccionPOS = response.data
          console.log('+ methods:saveTransaction', 'transaccionPOS {}', JSON.stringify(this.transaccionPOS))
        })
        .catch(error => {
          console.log(error)
          this.isErrorGuardarTransaccion = true
          console.log('+ methods:saveTransaction', '! error', 'isErrorGuardarTransaccion = ' + this.this.isErrorGuardarTransaccion)
        })
        .finally(() => {
          this.valuePOS = param.montoTotal
          this.ballotNumberPOS = this.transaccionPOS.codigo
          this.loadingGuardarTransaccion = false
          console.log('+ methods:saveTransaction', 'valuePOS = ' + this.valuePOS, 'ballotNumberPOS = ' + this.ballotNumberPOS, 'loadingGuardarTransaccion = ' + this.loadingGuardarTransaccion)
        })
    },

    //realizar el pago en el POS
    pagarPOS() {
      console.log("- methods:pagarPOS", "valuePOS = " + this.valuePOS, "ballotNumberPOS = " + this.transaccionPOS.codigo, "-> methods:sendNewSale")
      // Método en mixins
      this.sendNewSale(this.valuePOS, this.ballotNumberPOS)
    },
    // Imprimir voucher + boletos
    imprimir() {
      // Imprimir Voucher
      console.log("imprimir");
      this.imprimirVoucher(
        this.paymentPOS,
        this.ticketsGenerados.boletos,
        this.transaccionPOS.codigo
      );
    },
    //imprimir comprobante de error
    imprimirComprobanteError() {
      console.log("imprimirComprobanteError");
      console.log("transaccionPOS", this.transaccionPOS.codigo);
      ////this.imprimirVoucherError(this.paymentPOS, this.transaccionPOS.codigo)
      this.imprimirVoucherError(
        this.paymentPOS,
        this.transaccionPOS.codigo ? this.transaccionPOS.codigo : "SIN CODIGO"
      );
    },
    //buscar la ruta de cada boleto
    buscarRuta(origen, destino) {
      let ruta = this.propsPersonalInformation.tickets.find(
        (e) => e.origen === origen && e.destino === destino
      );
      return ruta.trip;
    },
    //guardar transacción POS
    guardarTransaccionPOS: async function () {
      this.loadingTerminarTransaccionPOS = false;

      const proxy = URL_PROXY;
      const api = "integrador-web/rest/pago/terminarTransaccionPOS";

      const param = {
        orden: this.transaccionPOS.codigo, // <- Pullman
        codigoTransaccion: this.paymentPOS.auth_code, //<- POS
        numeroCuota: "0",
        numeroTarjeta: this.paymentPOS.card_number.replace(/\*/g, ""), //<- POS
        tipoPago: this.paymentPOS.payment_type, //<- POS
        fechaCompra: [
          this.paymentPOS.transaction_date.slice(-4), //<- POS YYYY
          this.paymentPOS.transaction_date.slice(2, 4), //<- POS MM
          this.paymentPOS.transaction_date.slice(0, 2), //<- POS DD
          this.paymentPOS.transaction_hour.slice(0, 4), //<- POS YYYY
        ].join(""),
        codigoRespuesta: 0,
      };
      console.log("guardarTransaccionPOS", "param {}", param);
      await this.axios
        .post([proxy, api].join("/"), param)
        .then((response) => {
          //console.log('ticketsGenerados', this.ticketsGenerados)////////
          this.ticketsGenerados = response.data;
        })
        .catch((error) => {
          console.log(error);
          this.isErrorTerminarTransaccionPOS = true;
        })
        .finally(() => {
          this.loadingTerminarTransaccionPOS = true;
        });
    },

    //liberar asientos reservados
    liberarAsientos() {
      for (let ticket of this.propsPersonalInformation.tickets) {
        this.seatReservation("delete", {
          servicio: ticket.servicio,
          fecha: ticket.fechaServicio,
          origen: ticket.origen,
          destino: ticket.destino,
          integrador: ticket.integrador,
          asiento: ticket.asiento,
          codigoReserva: ticket.codeReservation
        });
      }
    },
    //salir a Home
    goHome() {
      this.liberarAsientos();
      //this.$router.push('/')
      this.$router.push({ name: "Home" });
    },
    // Click Toolbar button
    eventClick: function (name) {
      console.log("- methods:eventClick", "Right-Button = " + name);
      // Opción PAGAR o ANULAR
      if ("Right-Button" === name) {
        //<- PAGAR
        console.log("+ methods:eventClick", "-> methods:pagar");
        this.pagar(); // <- Inicio el proceso de pago (2)
      } else {
        //<- ANULAR
        console.log("+ methods:eventClick", "-> goHome");
        this.goHome();
      }
    },
  },

  mounted() {
    this.propsPersonalInformation.tickets = this.getTravelBus();
    console.log(
      "- mounted",
      "propsPersonalInformation.tickets {}",
      this.propsPersonalInformation.tickets
    );
    this.calculateTotal();
  },

  watch: {
    //variable que saca fuera de servicio al totem
    isOutService: function (val) {
      console.log("- watch:isOutService", "isOutService = " + val);
      if (val) {
        //<- la variable isOutService está en el mixins
        console.log(
          "+ watch:isOutService",
          "! terminar temporizador pantalla modal",
          "-> clearTimeout",
          "! ir pantalla outservice",
          "-> router:push:outofservice",
          "isOutService = " + val
        );
        // Terminar el temporizador de la pantalla modal
        clearTimeout(this.timeClose);
        // Ir a pantalla OutService
        this.$router.push("/outofservice");
      }
    },
    //verificar error en GuardarTransaccion API Pullman (1)
    isErrorGuardarTransaccion: function (val) {
      console.log(
        "- watch:isErrorGuardarTransaccion",
        "isErrorGuardarTransaccion = " + val
      );
      if (val) {
        // Mostrar mensajes de error en la pantalla modal
        this.propsPaymentControl.isChangeStatus = true;
        console.log(
          " + watch:isErrorGuardarTransaccion",
          "! mostrar mensaje error",
          "propsPaymentControl.isChangeStatus = " +
            this.propsPaymentControl.isChangeStatus
        );
      }
    },
    //error en TerminarTransaccionPOS API Pullman (2)
    isErrorTerminarTransaccionPOS: function (val) {
      console.log(
        "- watch:isErrorTerminarTransaccionPOS",
        "isErrorTerminarTransaccionPOS = " + val
      );
      if (val) {
        // Mostrar mensajes de error en la pantalla modal
        this.propsPaymentControl.isChangeStatus = true;
        console.log(
          "+ watch:isErrorGuardarTransaccion",
          "! mostrar mensaje error",
          "propsPaymentControl.isChangeStatus = " +
            this.propsPaymentControl.isChangeStatus
        );
      }
    },
    //ocurre cuando se presiona un botón el la pantalla modal
    nameActionModal: function () {
      console.log("- watch:nameActionModal", "-> clearTimeout");
      // Borrar los tiempos
      clearTimeout(this.timeClose);
      if ("salir" === this.nameActionModal) {
        console.log(
          "+ watch:nameActionModal",
          "nameActionModal = " + this.nameActionModal,
          "-> goHome"
        );
        this.goHome();
      } else if ("cerrar" === this.nameActionModal) {
        //Valores pantalla Modal
        this.$bvModal.hide("modal-payment-control");
        this.propsPaymentControl.isChangeStatus = false;
        //Valores guardarTransaccion
        this.isErrorGuardarTransaccion = false;
        this.loadingGuardarTransaccion = true;
        //Contador de intentos de pago
        this.countModal++;
        console.log(
          "+ watch:nameActionModal",
          "nameActionModal = " + this.nameActionModal,
          "-> goHome"
        );
      }
      this.nameActionModal = "";
      this.nameButton = "";
      this.isCheckOutService = false;
      console.log(
        "+ watch:nameActionModal",
        "nameActionModal = " + this.nameActionModal,
        "nameButton = " + this.nameButton,
        "isCheckOutService = " + this.isCheckOutService
      );
    },
    //ocurre cuando se acaba el tiempo de espera en la pantalla modal
    timeChangeEstatus: function (val) {
      console.log("- methods:timeChangeEstatus", "! Número de intentos " + val);
      // Verifica que el estado este en true que define el vencimiento
      if (val) {
        // Verificar que el número de intentos no exceda a 3
        if (3 > this.countModal) {
          // Mensaje de la pantalla modal
          this.propsPaymentControl.msg = "Se excedió el tiempo de espera";
        } else {
          //<- Vuelva a intentar
          // Mensaje de la pantalla modal
          this.propsPaymentControl.msg = "Superó el número máximo de intentos";
          // Estado del botón "Intente de Nuevo"
          this.propsPaymentControl.isTryAgain = false;
        }

        // Props para que cambie el mensaje de la pantalla modals
        this.propsPaymentControl.isChangeStatus = true;

        // Borrar variable de tiempo de espera
        clearTimeout(this.timeClose);
        // Tiempo de espera
        this.timeClose = setTimeout(
          function () {
            this.goHome();
          }.bind(this),
          10 * 1000
        );
      }
    },
    //se terminó el chequeo de las variables de isOutService
    isCheckOutService: function (val) {
      if (val) this.saveTransaction();
    },
    //cambio de estado en loadingGuardarTransaccion (1)
    loadingGuardarTransaccion: function (val) {
      console.log(
        "- watch:loadingGuardarTransaccion",
        "loadingGuardarTransaccion=" + val,
        "isErrorGuardarTransaccion=" + this.isErrorGuardarTransaccion
      );
      // terminó de ejecutarse guardarTransaccion y está sin error
      if (!val && !this.isErrorGuardarTransaccion) {
        console.log("+ watch:loadingGuardarTransaccion", "-> methods:pagarPOS");
        this.pagarPOS(); //<- Realizar el pago en el POS
      }
    },
    //fin de transacción del POS
    endTransactionPOS: function (val) {
      console.log("- watch:endTransactionPOS", "endTransactionPOS = " + val);
      if (val) {
        // Verifico si hay error en la transacción de pago
        if (this.isErrorPOS) {
          //<- hay error
          this.propsPaymentControl.isChangeStatus = true;
          console.log(
            "+ watch:endTransactionPOS",
            "isErrorPOS =" + this.isErrorPOS,
            "propsPaymentControl.isChangeStatus = " +
              this.propsPaymentControl.isChangeStatus
          );
        } else {
          //<- No hay error
          console.log(
            "+ watch:endTransactionPOS",
            "isErrorPOS =" + this.isErrorPOS,
            "-> guardarTransaccionPOS"
          );
          this.guardarTransaccionPOS();
        }
      }
    },
    //terminó la generación de boletos
    loadingTerminarTransaccionPOS: function (val) {
      console.log(
        "- watch:loadingTerminarTransaccionPOS",
        "loadingTerminarTransaccionPOS = " + val,
        "ticketsGenerados =" + this.ticketsGenerados
      );
      // Verificar que se generaron los boletos
      if (val && this.ticketsGenerados.boletos) {
        console.log(
          "+ watch:loadingTerminarTransaccionPOS",
          "-> clearTimeout",
          "-> imprimir",
          "-> router:push:payamount"
        );
        // Imprimir voucher + boletos
        clearTimeout(this.timeClose);
        this.imprimir();
        this.$router.push("/payamount");
      } else if (val && this.ticketsGenerados.estado === false) {
        console.log(
          "+ watch:loadingTerminarTransaccionPOS",
          "ticketsGenerados.estado = " + this.ticketsGenerados.estado,
          "-> clearTimeout",
          "-> imprimirComprobanteError",
          "-> router:push:payamount"
        );
        clearTimeout(this.timeClose);
        this.imprimirComprobanteError();
        this.$router.push("/payamount");
      }
    },
  },
};
</script>
