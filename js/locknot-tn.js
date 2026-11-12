/* LOCKNOT en Tienda Nube (Ipanema): generado por proyectos/locknot/03_web/armar_js_tn.py desde preview-html/locknot.js.
   El precio sale de la ficha real y la compra usa el carrito nativo de Tienda Nube (pixel y checkout incluidos). */
(function () {
  "use strict";
  document.documentElement.classList.add("lk-js");
  window.LK_OK = true;
  var CONF = window.LK_CONFIG || {};
  var BASE = CONF.cdn ? CONF.cdn.replace(/\/$/, "") + "/" : "";

  /* ---------- la ficha nativa: precio, variantes y formulario del carrito ---------- */
  var ficha = document.querySelector("#single-product[data-variants]");
  var formNativo = ficha && ficha.querySelector("#product_form");
  var variantes = [];
  try { variantes = ficha ? JSON.parse(ficha.getAttribute("data-variants")) || [] : []; } catch (e) { variantes = []; }
  function numero(v) {
    var n = typeof v === "number" ? v : parseFloat(String(v || "").replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", "."));
    return isFinite(n) && n > 0 ? n : 0;
  }

  /* ---------- PRECIOS (subidos el 10/11, opción B del usuario): se cambian solo acá y en las promos de Tienda Nube ----------
     1 par $34.900 · 2do par al 50% (2 pares, 25% OFF en Tienda Nube) con envío gratis
     Equipo: desde 5 pares, 40% OFF en cada par, con envío gratis y 3 cuotas sin interés */
  var PRECIO_PAR = CONF.precio || 34900;
  var precioFicha = variantes[0] ? numero(variantes[0].price_number) : 0;
  if (precioFicha && precioFicha > PRECIO_PAR / 3 && precioFicha < PRECIO_PAR * 3) PRECIO_PAR = precioFicha;
  var PACKS = { 1: PRECIO_PAR, 2: Math.round(PRECIO_PAR * 2 * 0.75) };   // 2 pares: 25% OFF en Tienda Nube (2do al 50%)
  var PAR_EQUIPO = Math.round(PRECIO_PAR * 0.6);                        // equipo: 40% OFF en Tienda Nube
  var MINIMO_EQUIPO = 5;                                    // el 40% OFF va desde 5 pares
  var CUOTAS_EQUIPO = 3;

  /* Los de la lista de la proveedora que van con logo blanco. El naranja es a pedido: mínimo 200 pares por color, falta confirmarlo. */
  var COLORES = [
    { id: "naranja", nombre: "Naranja", hex: "#FF6B1A" },
    { id: "negra", nombre: "Negro", hex: "#121216" },   // 7/11: el nombre como en Tienda Nube; el id arma el nombre de las fotos
    { id: "azul", nombre: "Azul", hex: "#1228AA" },
    { id: "verde", nombre: "Verde", hex: "#18703A" },
    { id: "fucsia", nombre: "Fucsia", hex: "#F0288C" },
    { id: "celeste", nombre: "Celeste", hex: "#1996F0" },
    { id: "roja", nombre: "Rojo", hex: "#CD2D23" }
  ];
  var BOTINES = [
    { id: "negro", nombre: "Negro" },
    { id: "azul", nombre: "Azul" },
    { id: "rojo", nombre: "Rojo" },
    { id: "fluor", nombre: "Flúor" },
    { id: "blanco", nombre: "Blanco" }
  ];

  function plata(n) { return "$" + Number(n).toLocaleString("es-AR"); }
  function color(id) { return COLORES.filter(function (c) { return c.id === id; })[0]; }
  function foto(botin, banda) { return BASE + "img/p/" + botin + "_" + banda + ".webp"; }

  function fichas(grupo, elegido) {
    return COLORES.map(function (c) {
      return '<label class="lk-ficha" style="--c:' + c.hex + '" title="' + c.nombre + '"><input type="radio" name="' + grupo + '" value="' + c.id + '" aria-label="' + c.nombre + '"' + (c.id === elegido ? " checked" : "") + '><span></span></label>';
    }).join("");
  }

  function talles(grupo, elegido) {
    return ["Chico", "Grande"].map(function (t) {
      return '<label><input type="radio" name="' + grupo + '" value="' + t + '"' + (t === elegido ? " checked" : "") + "><span>" + t + "</span></label>";
    }).join("");
  }

  /* Cambia la foto recién cuando la nueva ya está lista, para que no parpadee */
  function ponerFoto(img, src) {
    var nueva = new Image();
    var turno = (img._turno = (img._turno || 0) + 1);
    var poner = function () { if (img._turno === turno) img.src = src; };
    nueva.src = src;
    if (nueva.decode) nueva.decode().then(poner, poner);
    else nueva.onload = poner;
  }

  /* Aparece al llegar */
  var aparecen = document.querySelectorAll(".lk-rev");
  if ("IntersectionObserver" in window) {
    var verRev = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("lk-ver"); verRev.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    aparecen.forEach(function (el) { verRev.observe(el); });
  } else {
    aparecen.forEach(function (el) { el.classList.add("lk-ver"); });
  }

  /* ---------- Probador: botín y banda ---------- */
  document.querySelectorAll("[data-lk-probador]").forEach(function (caja) {
    var img = caja.querySelector("[data-foto]");
    var nombre = caja.querySelector("[data-nombre]");
    var botin = "negro", banda = "naranja", grupo = "probador";
    caja.querySelector("[data-botines]").innerHTML = BOTINES.map(function (b) {
      return '<label class="lk-pill"><input type="radio" name="' + grupo + '-botin" value="' + b.id + '"' + (b.id === botin ? " checked" : "") + "><span>" + b.nombre + "</span></label>";
    }).join("");
    caja.querySelector("[data-colores]").innerHTML = fichas(grupo + "-banda", banda);
    var cargadas = {};
    function precargar() {
      if (cargadas[botin]) return;
      cargadas[botin] = true;
      COLORES.forEach(function (c) { new Image().src = foto(botin, c.id); });
    }
    caja.addEventListener("change", function (ev) {
      if (ev.target.name === grupo + "-botin") botin = ev.target.value;
      if (ev.target.name === grupo + "-banda") { banda = ev.target.value; nombre.textContent = color(banda).nombre; }
      ponerFoto(img, foto(botin, banda));
      img.alt = "Botín " + botin + " con la banda LOCKNOT color " + color(banda).nombre.toLowerCase();
      precargar();
    });
  });

  /* ---------- Galería: contador y miniaturas ---------- */
  var fotos = document.querySelector(".lk-fotos");
  if (fotos) {
    var contador = document.querySelector(".lk-contador");
    var minis = document.querySelectorAll(".lk-miniaturas button");
    var total = fotos.children.length;
    var marcar = function () {
      var i = Math.round(fotos.scrollLeft / fotos.clientWidth);
      if (contador) contador.textContent = (i + 1) + " / " + total;
      minis.forEach(function (b, n) { b.setAttribute("aria-current", n === i ? "true" : "false"); });
    };
    fotos.addEventListener("scroll", function () { window.requestAnimationFrame(marcar); }, { passive: true });
    minis.forEach(function (b, n) {
      b.addEventListener("click", function () { fotos.scrollTo({ left: n * fotos.clientWidth, behavior: "smooth" }); });
    });
    marcar();
  }

  /* ---------- Compra: un color y un talle por cada par ---------- */
  var cajaPares = document.getElementById("lk-pares");
  var pedido = { cantidad: 2, pares: [
    { color: "naranja", talle: "Chico" },
    { color: "celeste", talle: "Chico" },
    { color: "fucsia", talle: "Chico" }
  ] };

  function pintarPares() {
    var filas = "";
    for (var i = 0; i < pedido.cantidad; i++) {
      var p = pedido.pares[i];
      filas += '<div class="lk-par" data-par="' + i + '">' +
        '<div class="lk-par-cabeza"><p><strong>Par ' + (i + 1) + "</strong> <span data-nombre>" + color(p.color).nombre + "</span></p>" +
        '<div class="lk-seg" role="group" aria-label="Talle del par ' + (i + 1) + '">' + talles("talle-" + i, p.talle) + "</div></div>" +
        '<div class="lk-fichas">' + fichas("color-" + i, p.color) + "</div></div>";
    }
    cajaPares.innerHTML = filas;
  }

  function pintarTotal() {
    var importe = PACKS[pedido.cantidad];
    var lista = PRECIO_PAR * pedido.cantidad;
    document.querySelectorAll("[data-lk-total]").forEach(function (el) { el.textContent = plata(importe); });
    var detalle = pedido.cantidad === 1 ? "1 par" : "2 pares: el segundo, al 50%";
    document.querySelectorAll("[data-lk-detalle]").forEach(function (el) { el.textContent = detalle; });
    /* 11/11 (Fran, Vértice: "cuando elijo el descuento progresivo, el número por par de arriba no se modifica"):
       con 2 pares, arriba dice $26.175 el par, con $34.900 tachado y "2 pares $52.350" */
    var conDescuento = importe < lista;
    document.querySelectorAll("[data-lk-par]").forEach(function (el) { el.textContent = plata(Math.round(importe / pedido.cantidad)); });
    document.querySelectorAll("[data-lk-lista]").forEach(function (el) { el.textContent = plata(PRECIO_PAR); el.hidden = !conDescuento; });
    document.querySelectorAll("[data-lk-pack-texto]").forEach(function (el) {
      el.textContent = conDescuento ? pedido.cantidad + " pares " + plata(importe) : "";
      el.hidden = !conDescuento;
    });
    var ahorro = document.querySelector("[data-lk-ahorro]");
    if (ahorro) {
      ahorro.textContent = lista > importe ? "Ahorrás " + plata(lista - importe) + " y el envío es gratis" : "";
      ahorro.hidden = !(lista > importe);
    }
  }

  if (cajaPares) {
    pintarPares();
    pintarTotal();
    /* 7/11: la foto del color ya no es la primera de la galería: se busca su lugar */
    var fotoColor = document.getElementById("lk-foto-color");
    var lugarColor = fotoColor ? Array.prototype.indexOf.call(fotoColor.parentNode.children, fotoColor) : 0;
    var miniColor = document.querySelectorAll(".lk-miniaturas button img")[lugarColor];
    var cajaCompra = document.querySelector(".lk-compra");
    cajaCompra.addEventListener("change", function (ev) {
      var nombreInput = ev.target.name || "";
      if (nombreInput === "pack") {
        pedido.cantidad = Number(ev.target.value);
        pintarPares();
        pintarTotal();
        return;
      }
      var fila = ev.target.closest("[data-par]");
      if (!fila) return;
      var par = pedido.pares[Number(fila.dataset.par)];
      if (nombreInput.indexOf("talle-") === 0) par.talle = ev.target.value;
      if (nombreInput.indexOf("color-") === 0) {
        par.color = ev.target.value;
        fila.querySelector("[data-nombre]").textContent = color(par.color).nombre;
        var src = foto("estudio", par.color);
        ponerFoto(fotoColor, src);
        if (miniColor) miniColor.src = src;
        if (fotos) fotos.scrollTo({ left: lugarColor * fotos.clientWidth, behavior: "smooth" });
      }
    });
    window.addEventListener("load", function () {
      COLORES.forEach(function (c) { new Image().src = foto("estudio", c.id); });
    });
  }

  /* ---------- Comprar: cada par al carrito nativo, con su talle y su color ----------
     Agrupa los pares iguales y los agrega de a un grupo con LS.addToCartEnhanced (lo mismo que el botón de Ipanema),
     eligiendo antes la variante en los <select> nativos. Al terminar, lleva al carrito. */
  /* 7/11: en el panel los colores son "Negro" y "Rojo" (como los sugiere Tienda Nube); se aceptan también "Negra" y "Roja",
     por si alguien cambia el nombre de la variante */
  var MISMO_COLOR = { negra: "negro", roja: "rojo" };
  function normal(t) { var s = String(t).trim().toLowerCase(); return MISMO_COLOR[s] || s; }
  function elegirOpcion(select, texto) {
    var buscado = normal(texto);
    for (var i = 0; i < select.options.length; i++) {
      var o = select.options[i];
      if (normal(o.text) === buscado || normal(o.value) === buscado) { select.value = o.value; return true; }
    }
    return false;
  }
  function elegirVariante(par) {
    var selects = formNativo.querySelectorAll("select.js-variation-option");
    var elegidos = 0;
    Array.prototype.forEach.call(selects, function (s) {
      if (elegirOpcion(s, par.talle) || elegirOpcion(s, color(par.color).nombre)) elegidos++;
    });
    Array.prototype.forEach.call(selects, function (s) { s.dispatchEvent(new Event("change", { bubbles: true })); });
    return selects.length > 0 && elegidos === selects.length;
  }
  function cantidadNativa(n) {
    var cant = formNativo.querySelector(".js-quantity-input");
    if (!cant) {
      cant = document.createElement("input");
      cant.type = "hidden"; cant.name = "quantity";
      formNativo.appendChild(cant);
    }
    cant.value = String(n);
  }
  function comprar(pares, boton) {
    if (!formNativo || !window.LS || typeof window.LS.addToCartEnhanced !== "function") {
      if (CONF.urlProducto && location.pathname.indexOf("/productos/") !== 0) location.href = CONF.urlProducto + "#comprar";
      return;
    }
    var grupos = [];
    pares.forEach(function (p) {
      var g = grupos.filter(function (x) { return x.talle === p.talle && x.color === p.color; })[0];
      if (g) g.n++; else grupos.push({ talle: p.talle, color: p.color, n: 1 });
    });
    var textoBoton = boton ? boton.textContent : "";
    if (boton) { boton.textContent = "Agregando…"; boton.setAttribute("aria-busy", "true"); }
    var terminar = function (error) {
      if (boton) { boton.textContent = textoBoton; boton.removeAttribute("aria-busy"); }
      if (error) { alert("No pudimos agregar todo al carrito. Probá de nuevo o escribinos."); return; }
      location.href = formNativo.getAttribute("action") || "/comprar/";
    };
    var paso = function (i) {
      if (i >= grupos.length) return terminar();
      var g = grupos[i];
      if (!elegirVariante(g)) return terminar(new Error("variante"));
      cantidadNativa(g.n);
      window.LS.addToCartEnhanced(formNativo, "", "Agregando…", "Sin stock", true,
        function () { paso(i + 1); }, function () { terminar(new Error("carrito")); });
    };
    paso(0);
  }
  document.querySelectorAll("[data-lk-comprar]").forEach(function (b) {
    b.addEventListener("click", function (ev) {
      ev.preventDefault();
      comprar(pedido.pares.slice(0, pedido.cantidad), b);
    });
  });

  /* ---------- Armá el equipo (11/11, versión 2) ----------
     Usuario, 11/11: "que puedan seleccionar cuántos son en el equipo y de ahí el desplegable para poder seleccionar. Y un
     botón: si tenés dudas hablame al WhatsApp… podemos armar un carro nosotros y pasar el link".
     1) ¿Cuántos son? (5, 7, 9, 11 u otro número con − n +; desde 5 va el 40% OFF).
     2) Una fila por jugador con dos desplegables nativos: color y talle. Atajos: un color o un talle para todos, y mezclar.
     3) WhatsApp con el equipo ya escrito, y "Copiar el link de este equipo": ?equipo=naranja-c2,azul-g3 abre el armador
        completo (no agrega nada al carrito solo).
     La cancha (solo compu) es un dibujo que se pinta con lo elegido. */
  var TALLES_EQUIPO = ["Chico", "Grande"];
  var MAX_EQUIPO = 30;
  var TAMANIOS = [5, 7, 9, 11];
  var WHATSAPP = "5492215231153";                           // el de la tienda (botón flotante y Contacto, 11/11)
  var FORMACIONES = {
    5: [[50, 90], [24, 67], [76, 67], [34, 36], [66, 36]],
    7: [[50, 91], [20, 71], [50, 74], [80, 71], [28, 44], [72, 44], [50, 20]],
    9: [[50, 92], [18, 74], [50, 77], [82, 74], [18, 50], [50, 53], [82, 50], [34, 25], [66, 25]],
    11: [[50, 93], [13, 75], [37, 79], [63, 79], [87, 75], [18, 51], [50, 54], [82, 51], [18, 25], [50, 21], [82, 25]]
  };
  function puestos(n) {
    var base = n <= 5 ? 5 : n <= 7 ? 7 : n <= 9 ? 9 : 11;
    return FORMACIONES[base].slice(0, Math.min(n, 11));
  }
  /* Link del equipo: color + c/g + cantidad. Acepta también "negro" y "rojo" (como dice el panel de Tienda Nube). */
  var ALIAS_COLOR = { negro: "negra", rojo: "roja" };
  function leerLinkEquipo(texto) {
    if (!texto) return null;
    var lista = [];
    String(texto).toLowerCase().split(/[,;\s]+/).forEach(function (pieza) {
      var m = /^([a-z]+)-([cg])(\d{1,2})$/.exec(pieza);
      if (!m) return;
      var id = ALIAS_COLOR[m[1]] || m[1];
      if (!color(id)) return;
      var n = Math.min(Number(m[3]), MAX_EQUIPO);
      for (var i = 0; i < n && lista.length < MAX_EQUIPO; i++) lista.push({ color: id, talle: m[2] === "c" ? "Chico" : "Grande" });
    });
    return lista.length >= MINIMO_EQUIPO ? lista : null;
  }

  document.querySelectorAll("[data-lk-pizarra]").forEach(function (caja, nCaja) {
    var g = "eq" + nCaja;                                   // prefijo de ids, por si hay más de un armador
    /* arranca con 7, uno de cada color, en chico */
    var jugadores = COLORES.map(function (c) { return { color: c.id, talle: "Chico" }; });
    var desdeLink = leerLinkEquipo(new URLSearchParams(location.search).get("equipo"));
    if (desdeLink) jugadores = desdeLink;

    function totalPares() { return jugadores.length; }
    function paresEquipo() { return jugadores.slice(); }
    function agrupado() {
      var grupos = [];
      jugadores.forEach(function (j) {
        var gr = grupos.filter(function (x) { return x.color === j.color && x.talle === j.talle; })[0];
        if (gr) gr.n++; else grupos.push({ color: j.color, talle: j.talle, n: 1 });
      });
      return grupos;
    }
    function resumenTexto() {
      return agrupado().map(function (x) { return x.n + " " + color(x.color).nombre.toLowerCase() + " " + x.talle.toLowerCase(); }).join(", ");
    }
    function linkEquipo() {
      var piezas = agrupado().map(function (x) { return x.color + "-" + (x.talle === "Chico" ? "c" : "g") + x.n; });
      return location.origin + location.pathname + "?equipo=" + piezas.join(",") + "#equipo";
    }
    function opcionesColor(elegido, conVacio) {
      return (conVacio ? '<option value="">' + conVacio + "</option>" : "") + COLORES.map(function (c) {
        return '<option value="' + c.id + '"' + (c.id === elegido ? " selected" : "") + ">" + c.nombre + "</option>";
      }).join("");
    }
    function opcionesTalle(elegido, conVacio) {
      return (conVacio ? '<option value="">' + conVacio + "</option>" : "") + TALLES_EQUIPO.map(function (t) {
        return '<option value="' + t + '"' + (t === elegido ? " selected" : "") + ">" + t + "</option>";
      }).join("");
    }

    caja.innerHTML =
      '<div class="lk-cancha" aria-hidden="true">' +
        '<svg viewBox="0 0 100 125" preserveAspectRatio="none"><defs><filter id="lk-tiza-' + g + '" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="0.7"/></filter></defs>' +
          '<g fill="none" stroke="#fff" stroke-opacity=".72" stroke-width="2" vector-effect="non-scaling-stroke" filter="url(#lk-tiza-' + g + ')">' +
            '<rect x="4" y="4" width="92" height="117" vector-effect="non-scaling-stroke"/>' +
            '<path d="M4 34H96" vector-effect="non-scaling-stroke"/><path d="M36 34a14 14 0 0 1 28 0" vector-effect="non-scaling-stroke"/>' +
            '<path d="M22 121V97H78V121" vector-effect="non-scaling-stroke"/><path d="M38 121V111H62V121" vector-effect="non-scaling-stroke"/><path d="M38 97a14 12 0 0 1 24 0" vector-effect="non-scaling-stroke"/>' +
          "</g></svg>" +
        '<div class="lk-jugadores"></div>' +
        '<p class="lk-cancha-mas" data-mas-jugadores></p>' +
      "</div>" +
      '<div class="lk-armador">' +
        '<div class="lk-armador-paso">' +
          '<p class="lk-armador-titulo"><span>1</span>¿Cuántos son en el equipo?</p>' +
          '<div class="lk-cuantos">' +
            '<div class="lk-cuantos-botones" role="group" aria-label="Cantidad de jugadores">' +
              TAMANIOS.map(function (n) { return '<button type="button" data-tam="' + n + '" aria-pressed="false">' + n + "</button>"; }).join("") +
            "</div>" +
            '<div class="lk-cuantos-otro"><span>Otro número</span>' +
            '<div class="lk-cont lk-cont-otro" role="group" aria-label="Otro número">' +
              '<button type="button" data-menos aria-label="Un jugador menos">−</button>' +
              '<output data-cantidad aria-live="polite"></output>' +
              '<button type="button" data-mas aria-label="Un jugador más">+</button>' +
            "</div></div>" +
          "</div>" +
          '<p class="lk-armador-estado" data-estado aria-live="polite"></p>' +
        "</div>" +
        '<div class="lk-armador-paso">' +
          '<p class="lk-armador-titulo"><span>2</span>Color y talle de cada uno</p>' +
          '<div class="lk-atajos">' +
            '<label class="lk-select"><span class="lk-oculto">Un color para todos</span><select data-todos-color>' + opcionesColor("", "Mismo color") + "</select></label>" +
            '<label class="lk-select"><span class="lk-oculto">Un talle para todos</span><select data-todos-talle>' + opcionesTalle("", "Mismo talle") + "</select></label>" +
            '<button type="button" class="lk-atajo-mezclar" data-mezclar>Mezclar colores</button>' +
          "</div>" +
          '<p class="lk-armador-ayuda">Chico: hasta el número 30 · Grande: del 31 en adelante</p>' +
          '<ol class="lk-armador-lista" data-filas></ol>' +
        "</div>" +
        '<div class="lk-resumen">' +
          '<p class="lk-chips" data-chips></p>' +
          '<div class="lk-equipo-total"><b data-total-equipo></b></div>' +
          '<p class="lk-resumen-detalle" data-detalle-equipo></p>' +
          '<a class="lk-btn lk-btn-ancho" href="#" data-equipo-comprar>Comprar el equipo</a>' +
          '<p class="lk-aviso" role="status" data-tn="omitir" data-equipo-aviso></p>' +
          '<div class="lk-equipo-extra">' +
            '<a class="lk-equipo-wa" data-equipo-wa target="_blank" rel="noopener">' +
              '<svg class="lk-icono" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>' +
              "<span>¿Dudas con el equipo? <b>Escribinos por WhatsApp</b></span></a>" +
            '<button type="button" class="lk-equipo-link-btn" data-copiar-link>Copiar el link de este equipo</button>' +
            '<p class="lk-equipo-link-ok" data-link-ok role="status"></p>' +
            '<input class="lk-equipo-link-campo" data-link-campo type="text" readonly hidden aria-label="Link de este equipo">' +
          "</div>" +
        "</div>" +
      "</div>";

    var capa = caja.querySelector(".lk-jugadores");
    function $(s) { return caja.querySelector(s); }

    function pintarFilas() {
      $("[data-filas]").innerHTML = jugadores.map(function (j, i) {
        return '<li class="lk-jug-fila" data-i="' + i + '">' +
          '<span class="lk-jug-num" style="--c:' + color(j.color).hex + '" aria-hidden="true">' + (i + 1) + "</span>" +
          '<label class="lk-select"><span class="lk-oculto">Color del jugador ' + (i + 1) + '</span><select data-color>' + opcionesColor(j.color) + "</select></label>" +
          '<label class="lk-select"><span class="lk-oculto">Talle del jugador ' + (i + 1) + '</span><select data-talle>' + opcionesTalle(j.talle) + "</select></label>" +
          "</li>";
      }).join("");
    }

    function pintar() {
      var total = totalPares();
      $("[data-cantidad]").textContent = total;
      caja.querySelectorAll("[data-tam]").forEach(function (b) { b.setAttribute("aria-pressed", Number(b.dataset.tam) === total ? "true" : "false"); });
      $(".lk-cont-otro [data-menos]").disabled = total <= MINIMO_EQUIPO;
      $(".lk-cont-otro [data-mas]").disabled = total >= MAX_EQUIPO;
      var importe = PAR_EQUIPO * total;
      $("[data-estado]").innerHTML = "<b>" + total + " pares</b> a " + plata(PAR_EQUIPO) + " cada uno (40% OFF).";
      $("[data-chips]").innerHTML = agrupado().map(function (x) {
        return '<span class="lk-chip"><i style="--c:' + color(x.color).hex + '"></i>' + x.n + " " + color(x.color).nombre + " " + x.talle.toLowerCase() + "</span>";
      }).join("");
      $("[data-total-equipo]").textContent = plata(importe);
      $("[data-detalle-equipo]").textContent = total + " pares a " + plata(PAR_EQUIPO) + " cada uno (40% OFF). Ahorrás " + plata(PRECIO_PAR * total - importe) +
        ". Envío gratis y " + CUOTAS_EQUIPO + " cuotas sin interés de " + plata(Math.round(importe / CUOTAS_EQUIPO)) + ".";
      $("[data-equipo-wa]").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(
        "Hola! Quiero armar un equipo de " + total + " pares de LOCKNOT: " + resumenTexto() + ". ¿Me ayudan? " + linkEquipo());
      $("[data-link-ok]").textContent = "";
      $("[data-link-campo]").hidden = true;
      /* la cancha (solo compu): un círculo por jugador, hasta 11 */
      capa.innerHTML = puestos(total).map(function (pos, i) {
        return '<span class="lk-jugador" style="left:' + pos[0] + "%;top:" + pos[1] + "%;--c:" + color(jugadores[i].color).hex + '">' + (i + 1) + "</span>";
      }).join("");
      $("[data-mas-jugadores]").textContent = total > 11 ? "+" + (total - 11) + " pares más" : "";
    }

    /* Cambia la cantidad sin perder lo elegido: los nuevos siguen el color de todos (si es uno solo) o el próximo color */
    function cambiarCantidad(n) {
      n = Math.max(MINIMO_EQUIPO, Math.min(MAX_EQUIPO, n));
      var mismos = jugadores.every(function (j) { return j.color === jugadores[0].color; });
      while (jugadores.length < n) {
        var ultimo = jugadores[jugadores.length - 1] || { color: COLORES[0].id, talle: "Chico" };
        jugadores.push({ color: mismos ? ultimo.color : COLORES[jugadores.length % COLORES.length].id, talle: ultimo.talle });
      }
      jugadores.length = n;
      pintarFilas();
      pintar();
    }

    caja.addEventListener("click", function (ev) {
      var tam = ev.target.closest("[data-tam]");
      if (tam) { cambiarCantidad(Number(tam.dataset.tam)); return; }
      var mas = ev.target.closest("[data-mas]"), menos = ev.target.closest("[data-menos]");
      if (mas || menos) { cambiarCantidad(totalPares() + (mas ? 1 : -1)); return; }
      if (ev.target.closest("[data-mezclar]")) {
        jugadores.forEach(function (j, i) { j.color = COLORES[i % COLORES.length].id; });
        pintarFilas();
        pintar();
        return;
      }
      if (ev.target.closest("[data-copiar-link]")) {
        var link = linkEquipo();
        var campo = $("[data-link-campo]");
        var ok = $("[data-link-ok]");
        /* el link se muestra siempre (por si el portapapeles no responde) y se avisa "copiado" solo si se copió */
        campo.value = link;
        campo.hidden = false;
        ok.textContent = "Copiá este link y mandalo: abre este mismo equipo.";
        campo.focus();
        campo.select();
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(link).then(function () {
            if (campo.value === link) ok.textContent = "Link copiado. Pegalo en WhatsApp: abre este mismo equipo.";
          }, function () {});
        }
        return;
      }
      if (ev.target.closest("[data-equipo-comprar]")) {
        ev.preventDefault();
        if (totalPares() < MINIMO_EQUIPO) return;
        comprar(paresEquipo(), ev.target.closest("[data-equipo-comprar]"));
      }
    });

    caja.addEventListener("change", function (ev) {
      var s = ev.target;
      if (s.matches("[data-todos-color]") && s.value) {
        jugadores.forEach(function (j) { j.color = s.value; });
        s.value = "";
        pintarFilas();
        pintar();
        return;
      }
      if (s.matches("[data-todos-talle]") && s.value) {
        jugadores.forEach(function (j) { j.talle = s.value; });
        s.value = "";
        pintarFilas();
        pintar();
        return;
      }
      var fila = s.closest("[data-i]");
      if (!fila) return;
      var j = jugadores[Number(fila.dataset.i)];
      if (s.matches("[data-color]")) {
        j.color = s.value;
        fila.querySelector(".lk-jug-num").style.setProperty("--c", color(j.color).hex);
      }
      if (s.matches("[data-talle]")) j.talle = s.value;
      pintar();
    });

    pintarFilas();
    pintar();
    /* abierto desde un link de equipo: baja hasta el armador */
    if (desdeLink && nCaja === 0) {
      var bajar = function () { var sec = caja.closest("section") || caja; sec.scrollIntoView({ block: "start", behavior: "instant" }); };
      var dosVeces = function () { setTimeout(bajar, 150); setTimeout(bajar, 900); };  // la segunda, por si algo cargó tarde
      if (document.readyState === "complete") dosVeces();
      else window.addEventListener("load", dosVeces);
    }
  });

  /* ---------- Qué talle le va ---------- */
  /* Números argentinos (8/11, usuario: "al 24, 25 ponelo talle chiquito y para más grande talle grande, completá todos"):
     hasta el 30, chico; del 31 en adelante, grande. */
  var TALLES = { desde: 18, chicoHasta: 30, hasta: 46 };
  var numeros = document.getElementById("lk-numeros");
  var resultado = document.getElementById("lk-resultado");
  if (numeros && resultado) {
    var titulo = resultado.querySelector("b");
    var detalle = resultado.querySelector("p");
    var elegir = resultado.querySelector("button");
    var talleElegido = null;
    for (var n = TALLES.desde; n <= TALLES.hasta; n++) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = n;
      b.setAttribute("aria-pressed", "false");
      b.dataset.n = n;
      numeros.appendChild(b);
    }
    numeros.addEventListener("click", function (ev) {
      var boton = ev.target.closest("button");
      if (!boton) return;
      numeros.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === boton ? "true" : "false"); });
      var num = Number(boton.dataset.n);
      if (num < TALLES.desde || num > TALLES.hasta) {
        talleElegido = null;
        titulo.textContent = "Escribinos";
        detalle.textContent = "Para el " + num + " todavía no la probamos. Preguntanos antes de comprar.";
        elegir.hidden = true;
      } else {
        talleElegido = num <= TALLES.chicoHasta ? "Chico" : "Grande";
        titulo.textContent = talleElegido;
        detalle.textContent = "Para el número " + num + " va la banda " + talleElegido.toLowerCase() + ".";
        elegir.hidden = false;
        elegir.textContent = "Elegir talle " + talleElegido.toLowerCase();
      }
    });
    elegir.addEventListener("click", function () {
      pedido.pares.forEach(function (p) { p.talle = talleElegido; });
      if (cajaPares) pintarPares();
      document.getElementById("comprar").scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- Barra fija: aparece cuando ya se pasó el botón de compra, y se va en el equipo y en el cierre ---------- */
  var fija = document.querySelector(".lk-fija");
  var botonCompra = document.querySelector("#comprar .lk-btn");
  if (fija && botonCompra) {
    var tapan = [document.querySelector(".lk-cierre"), document.getElementById("equipo")].filter(Boolean);
    var pintarFija = function () {
      var yaPaso = botonCompra.getBoundingClientRect().bottom <= 0;
      var tapada = tapan.some(function (el) {
        var r = el.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });
      fija.classList.toggle("lk-ver", yaPaso && !tapada);
    };
    window.addEventListener("scroll", function () { window.requestAnimationFrame(pintarFija); }, { passive: true });
    window.addEventListener("resize", pintarFija);
    pintarFija();
  }
  /* ---------- Videos cortos (7/11): mudos y en loop; se bajan recién cuando aparecen en pantalla y se pausan al salir.
     Con "reducir movimiento" quedan quietos, en el póster. ---------- */
  var videos = document.querySelectorAll("video[data-src]");
  if (videos.length && "IntersectionObserver" in window &&
      !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    var verVideo = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.getAttribute("src")) v.setAttribute("src", v.getAttribute("data-src"));
          var jugar = v.play();
          if (jugar && jugar.catch) jugar.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    videos.forEach(function (v) { verVideo.observe(v); });
  }
  /* ---------- Aviso de cookies del tema (8/11, igual que en Axily): se ve recién cuando la persona baja y se esconde
     mientras el botón principal de compra está en pantalla ---------- */
  var raizCookies = document.documentElement, rafCookies = null;
  var botonPrincipal = document.querySelector("#comprar [data-lk-comprar]") || document.querySelector(".lk-hero .lk-btn");
  var chequearCookies = function () {
    rafCookies = null;
    var r = botonPrincipal && botonPrincipal.getBoundingClientRect();
    var tapaCompra = !!r && r.top < window.innerHeight && r.bottom > 0;
    raizCookies.classList.toggle("lk-cookies-espera", window.scrollY < window.innerHeight * 0.5 || tapaCompra);
  };
  window.addEventListener("scroll", function () { if (!rafCookies) rafCookies = window.requestAnimationFrame(chequearCookies); }, { passive: true });
  window.addEventListener("resize", chequearCookies);
  chequearCookies();
  /* ---------- Botón de WhatsApp del tema (12/11): en el celu tapaba la tarjeta "2 pares". Se esconde mientras el
     cuadro de compra está en pantalla y vuelve cuando la persona baja (la regla está en locknot.css) ---------- */
  var cuadroCompra = document.querySelector(".lk-compra"), rafWa = null;
  if (cuadroCompra) {
    var chequearWa = function () {
      rafWa = null;
      var r = cuadroCompra.getBoundingClientRect();
      document.documentElement.classList.toggle("lk-wa-espera", r.top < window.innerHeight && r.bottom > 0);
    };
    window.addEventListener("scroll", function () { if (!rafWa) rafWa = window.requestAnimationFrame(chequearWa); }, { passive: true });
    window.addEventListener("resize", chequearWa);
    chequearWa();
  }
})();
