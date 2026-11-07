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

  /* ---------- PRECIOS (cerrados el 7/11): se cambian solo acá y en las promos de Tienda Nube ----------
     1 par $29.900 · 2do par al 50% (2 pares, 25% OFF en Tienda Nube) con envío gratis
     Equipo: desde 5 pares, 40% OFF en cada par, con envío gratis y 3 cuotas sin interés */
  var PRECIO_PAR = CONF.precio || 29900;
  var precioFicha = variantes[0] ? numero(variantes[0].price_number) : 0;
  if (precioFicha && precioFicha > PRECIO_PAR / 3 && precioFicha < PRECIO_PAR * 3) PRECIO_PAR = precioFicha;
  var PACKS = { 1: PRECIO_PAR, 2: Math.round(PRECIO_PAR * 2 * 0.75) };   // 2 pares: 25% OFF en Tienda Nube (2do al 50%)
  var PAR_EQUIPO = Math.round(PRECIO_PAR * 0.6);                        // equipo: 40% OFF en Tienda Nube
  var EQUIPO = { 5: PAR_EQUIPO, 7: PAR_EQUIPO, 9: PAR_EQUIPO, 11: PAR_EQUIPO };
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

  /* ---------- Pizarra: armá el equipo ---------- */
  var FORMACIONES = {
    5: [[50, 90], [24, 67], [76, 67], [34, 36], [66, 36]],
    7: [[50, 91], [20, 71], [50, 74], [80, 71], [28, 44], [72, 44], [50, 20]],
    9: [[50, 92], [18, 74], [50, 77], [82, 74], [18, 50], [50, 53], [82, 50], [34, 25], [66, 25]],
    11: [[50, 93], [13, 75], [37, 79], [63, 79], [87, 75], [18, 51], [50, 54], [82, 51], [18, 25], [50, 21], [82, 25]]
  };
  document.querySelectorAll("[data-lk-pizarra]").forEach(function (caja) {
    var cantidad = 7, activo = 0;
    var equipo = [];
    for (var i = 0; i < 11; i++) equipo.push({ color: COLORES[i % COLORES.length].id, talle: "Chico" });

    caja.innerHTML =
      '<div class="lk-pizarra-izq">' +
        '<div class="lk-cantidades" role="group" aria-label="Cuántos jugadores">' +
          Object.keys(EQUIPO).map(function (n) {
            return '<button type="button" class="lk-cantidad" data-n="' + n + '"><b>' + n + "</b><small>" + plata(EQUIPO[n]) + " c/u</small></button>";
          }).join("") +
        "</div>" +
        '<div class="lk-cancha">' +
          '<svg viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="lk-tiza" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="0.7"/></filter></defs>' +
            '<g fill="none" stroke="#fff" stroke-opacity=".72" stroke-width="2" vector-effect="non-scaling-stroke" filter="url(#lk-tiza)">' +
              '<rect x="4" y="4" width="92" height="117" vector-effect="non-scaling-stroke"/>' +
              '<path d="M4 34H96" vector-effect="non-scaling-stroke"/><path d="M36 34a14 14 0 0 1 28 0" vector-effect="non-scaling-stroke"/>' +
              '<path d="M22 121V97H78V121" vector-effect="non-scaling-stroke"/><path d="M38 121V111H62V121" vector-effect="non-scaling-stroke"/><path d="M38 97a14 12 0 0 1 24 0" vector-effect="non-scaling-stroke"/>' +
            "</g></svg>" +
          '<div class="lk-jugadores"></div>' +
        "</div>" +
      "</div>" +
      '<div class="lk-panel">' +
        '<p class="lk-panel-titulo"><span data-jugador></span><span class="lk-panel-color" data-jugador-color></span></p>' +
        '<div class="lk-fichas" data-colores></div>' +
        '<div class="lk-panel-fila"><div class="lk-seg" role="group" aria-label="Talle del jugador" data-talle></div>' +
          '<button type="button" class="lk-accion" data-todos>Este color a todos</button>' +
          '<button type="button" class="lk-accion" data-mezclar>Mezclar colores</button></div>' +
        '<div class="lk-resumen">' +
          '<div class="lk-chips" data-chips></div>' +
          '<p class="lk-resumen-talles" data-talles></p>' +
          '<div class="lk-equipo-total"><b data-total-equipo></b></div>' +
          '<p class="lk-resumen-detalle" data-detalle-equipo></p>' +
          '<a class="lk-btn lk-btn-ancho" href="#" data-equipo-comprar>Quiero este equipo</a>' +
          '<p class="lk-aviso" role="status" data-tn="omitir" data-equipo-aviso></p>' +
        "</div>" +
      "</div>";

    var capa = caja.querySelector(".lk-jugadores");
    function $(s) { return caja.querySelector(s); }

    function pintarPanel() {
      var j = equipo[activo];
      $("[data-jugador]").textContent = "Jugador " + (activo + 1) + (activo === 0 ? " (arquero)" : "");
      $("[data-jugador-color]").textContent = color(j.color).nombre + ", talle " + j.talle.toLowerCase();
      $("[data-colores]").innerHTML = fichas("equipo-color", j.color);
      $("[data-talle]").innerHTML = talles("equipo-talle", j.talle);
    }

    function pintarResumen() {
      var usados = equipo.slice(0, cantidad);
      var cuenta = {}, chicos = 0;
      usados.forEach(function (j) { cuenta[j.color] = (cuenta[j.color] || 0) + 1; if (j.talle === "Chico") chicos++; });
      $("[data-chips]").innerHTML = COLORES.filter(function (c) { return cuenta[c.id]; }).map(function (c) {
        return '<span class="lk-chip" style="--c:' + c.hex + '"><i></i>' + cuenta[c.id] + " " + c.nombre + "</span>";
      }).join("");
      var grandes = cantidad - chicos;
      $("[data-talles]").textContent = [chicos ? chicos + (chicos === 1 ? " chico" : " chicos") : "", grandes ? grandes + (grandes === 1 ? " grande" : " grandes") : ""].filter(Boolean).join(" y ");
      var importe = EQUIPO[cantidad] * cantidad;
      $("[data-total-equipo]").textContent = plata(importe);
      $("[data-detalle-equipo]").textContent = cantidad + " pares a " + plata(EQUIPO[cantidad]) + " cada uno (40% OFF). Ahorrás " + plata(PRECIO_PAR * cantidad - importe) +
        ". Envío gratis y " + CUOTAS_EQUIPO + " cuotas sin interés de " + plata(Math.round(importe / CUOTAS_EQUIPO)) + ".";
    }

    function pintarJugadores() {
      var puestos = FORMACIONES[cantidad];
      var html = "";
      puestos.forEach(function (p, i) {
        html += '<button type="button" class="lk-jugador" data-j="' + i + '" style="left:' + p[0] + "%;top:" + p[1] + "%;--c:" + color(equipo[i].color).hex + '" aria-pressed="' + (i === activo) + '" aria-label="Jugador ' + (i + 1) + ", " + color(equipo[i].color).nombre + ", talle " + equipo[i].talle.toLowerCase() + '">' + (i + 1) + "</button>";
      });
      capa.innerHTML = html;
    }

    function pintarCantidades() {
      caja.querySelectorAll(".lk-cantidad").forEach(function (b) {
        b.setAttribute("aria-pressed", Number(b.dataset.n) === cantidad ? "true" : "false");
      });
    }

    function pintarTodo() { pintarCantidades(); pintarJugadores(); pintarPanel(); pintarResumen(); }

    caja.addEventListener("click", function (ev) {
      var cant = ev.target.closest(".lk-cantidad");
      if (cant) {
        cantidad = Number(cant.dataset.n);
        if (activo >= cantidad) activo = 0;
        pintarTodo();
        return;
      }
      var jug = ev.target.closest(".lk-jugador");
      if (jug) {
        activo = Number(jug.dataset.j);
        pintarJugadores();
        pintarPanel();
        capa.querySelector('[data-j="' + activo + '"]').focus({ preventScroll: true });
        return;
      }
      if (ev.target.closest("[data-todos]")) {
        for (var i = 0; i < 11; i++) equipo[i].color = equipo[activo].color;
        pintarJugadores(); pintarResumen();
        return;
      }
      if (ev.target.closest("[data-mezclar]")) {
        var inicio = Math.floor(Math.random() * COLORES.length);
        for (var k = 0; k < 11; k++) equipo[k].color = COLORES[(inicio + k) % COLORES.length].id;
        pintarJugadores(); pintarPanel(); pintarResumen();
        return;
      }
      if (ev.target.closest("[data-equipo-comprar]")) {
        ev.preventDefault();
        comprar(equipo.slice(0, cantidad), ev.target.closest("[data-equipo-comprar]"));
      }
    });

    caja.addEventListener("change", function (ev) {
      if (ev.target.name === "equipo-color") equipo[activo].color = ev.target.value;
      if (ev.target.name === "equipo-talle") equipo[activo].talle = ev.target.value;
      var boton = capa.querySelector('[data-j="' + activo + '"]');
      boton.style.setProperty("--c", color(equipo[activo].color).hex);
      boton.setAttribute("aria-label", "Jugador " + (activo + 1) + ", " + color(equipo[activo].color).nombre + ", talle " + equipo[activo].talle.toLowerCase());
      $("[data-jugador-color]").textContent = color(equipo[activo].color).nombre + ", talle " + equipo[activo].talle.toLowerCase();
      pintarResumen();
    });

    pintarTodo();
  });

  /* ---------- Qué talle le va ---------- */
  /* Números argentinos, sacados de la tabla del proveedor (5/11). A confirmar con las muestras. Debajo de "desde" no se promete nada: falta probar en botines tan chicos. */
  var TALLES = { desde: 26, chicoHasta: 30, hasta: 43 };
  var numeros = document.getElementById("lk-numeros");
  var resultado = document.getElementById("lk-resultado");
  if (numeros && resultado) {
    var titulo = resultado.querySelector("b");
    var detalle = resultado.querySelector("p");
    var elegir = resultado.querySelector("button");
    var talleElegido = null;
    for (var n = 24; n <= 46; n++) {
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
})();
