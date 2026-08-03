document.addEventListener("DOMContentLoaded", () => {

    const categoryTitles = {
        "all": "Catálogo de Productos (Todos)",
        "implementos": "Implementos Deportivos",
        "uniformes": "Uniformes Deportivos",
        "redes": "Redes y Mallas",
        "fitness": "Gimnasio y Fitness"
    };

    // ==========================================
    // 1. CAMBIO DE VISTAS (SPA EN UNA PÁGINA)
    // ==========================================
    const vistaPrincipal = document.getElementById("vista-principal");
    const vistaCatalogo = document.getElementById("vista-catalogo");
    const btnVolver = document.getElementById("btn-volver");
    const logoBtn = document.getElementById("logo-btn");
    const navInicio = document.getElementById("nav-inicio");
    const navCategorias = document.getElementById("nav-categorias");
    const navAbout = document.getElementById("nav-about");
    const catalogoTitulo = document.getElementById("catalogo-titulo-categoria");
    const productCards = document.querySelectorAll(".product-card");
    const filterBtns = document.querySelectorAll(".filter-btn");

    function mostrarVistaPrincipal() {
        vistaCatalogo.classList.add("hidden-view");
        vistaPrincipal.classList.remove("hidden-view");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function mostrarVistaCatalogo(categoryKey = "all") {
        vistaPrincipal.classList.add("hidden-view");
        vistaCatalogo.classList.remove("hidden-view");

        if (catalogoTitulo && categoryTitles[categoryKey]) {
            catalogoTitulo.textContent = categoryTitles[categoryKey];
        }

        filterBtns.forEach(b => {
            if (b.getAttribute("data-category") === categoryKey) {
                b.classList.add("active");
            } else {
                b.classList.remove("active");
            }
        });

        productCards.forEach(prod => {
            if (categoryKey === "all" || prod.getAttribute("data-category") === categoryKey) {
                prod.style.display = "flex";
            } else {
                prod.style.display = "none";
            }
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const categoryKey = btn.getAttribute("data-category");
            mostrarVistaCatalogo(categoryKey);
        });
    });

    if (btnVolver) btnVolver.addEventListener("click", mostrarVistaPrincipal);
    if (logoBtn) logoBtn.addEventListener("click", mostrarVistaPrincipal);
    if (navInicio) navInicio.addEventListener("click", (e) => { e.preventDefault(); mostrarVistaPrincipal(); });

    if (navCategorias) {
        navCategorias.addEventListener("click", (e) => {
            e.preventDefault();
            mostrarVistaPrincipal();
            setTimeout(() => {
                document.getElementById("sec-categorias").scrollIntoView({ behavior: "smooth" });
            }, 100);
        });
    }

    if (navAbout) {
        navAbout.addEventListener("click", (e) => {
            e.preventDefault();
            mostrarVistaPrincipal();
            setTimeout(() => {
                document.getElementById("sec-about").scrollIntoView({ behavior: "smooth" });
            }, 100);
        });
    }

    const btnsExplorar = document.querySelectorAll(".btn-explorar-todo");
    btnsExplorar.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            mostrarVistaCatalogo("all");
        });
    });

    // ==========================================
    // 2. SLIDER AUTOMÁTICO PARA EL BANNER (HERO)
    // ==========================================
    const slides = document.querySelectorAll(".hero .slide");
    const dots = document.querySelectorAll(".dots .dot");
    let currentHeroIndex = 0;

    function showHeroSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove("active");
            if (dots[i]) dots[i].classList.remove("active-dot");
        });

        slides[index].classList.add("active");
        if (dots[index]) dots[index].classList.add("active-dot");
    }

    function nextHeroSlide() {
        currentHeroIndex = (currentHeroIndex + 1) % slides.length;
        showHeroSlide(currentHeroIndex);
    }

    if (slides.length > 0) {
        let heroTimer = setInterval(nextHeroSlide, 4000);

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                clearInterval(heroTimer);
                currentHeroIndex = index;
                showHeroSlide(currentHeroIndex);
                heroTimer = setInterval(nextHeroSlide, 4000);
            });
        });
    }

    // ==========================================
    // 3. CAMBIO DE IMAGEN AL HOVER & CLICK EN TARJETAS DE CATEGORÍA
    // ==========================================
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        let cardTimer = null;
        const images = card.querySelectorAll(".card-images img");
        
        if (images.length > 1) {
            let currentIndex = 0;

            card.addEventListener("mouseenter", () => {
                cardTimer = setInterval(() => {
                    images[currentIndex].classList.remove("active");
                    currentIndex = (currentIndex + 1) % images.length;
                    images[currentIndex].classList.add("active");
                }, 2000);
            });

            card.addEventListener("mouseleave", () => {
                clearInterval(cardTimer);
                images.forEach(img => img.classList.remove("active"));
                currentIndex = 0;
                images[0].classList.add("active");
            });
        }

        // Al hacer clic en cualquier parte de la tarjeta o en "Ver más", navega al catálogo filtrado
        card.addEventListener("click", (e) => {
            const targetCategory = card.getAttribute("data-category-target");
            if (targetCategory) {
                mostrarVistaCatalogo(targetCategory);
            }
        });
    });

    // ==========================================
    // 4. LÓGICA COMPLETA DEL CARRITO DE COMPRAS
    // ==========================================
    let cart = [];

    const openCartBtn = document.getElementById("open-cart-btn");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartModal = document.getElementById("cart-modal");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalPrice = document.getElementById("cart-total-price");
    const cartCountBadge = document.getElementById("cart-count");
    const checkoutBtn = document.getElementById("checkout-btn");

    function toggleCart() {
        cartModal.classList.toggle("active");
        cartOverlay.classList.toggle("active");
    }

    if (openCartBtn) openCartBtn.addEventListener("click", (e) => { e.preventDefault(); toggleCart(); });
    if (closeCartBtn) closeCartBtn.addEventListener("click", toggleCart);
    if (cartOverlay) cartOverlay.addEventListener("click", toggleCart);

    function addToCart(id, name, price) {
        const existingIndex = cart.findIndex(item => item.id === id);

        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({ id, name, price: parseFloat(price), quantity: 1 });
        }

        updateCartUI();
    }

    // Solo los botones dentro del catálogo (.add-to-cart-sm) agregan productos
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-cart-sm")) {
            e.preventDefault();
            const id = e.target.getAttribute("data-id");
            const name = e.target.getAttribute("data-name");
            const price = e.target.getAttribute("data-price");

            if (id && name && price) {
                addToCart(id, name, price);
            }
        }
    });

    function updateCartUI() {
        cartItemsContainer.innerHTML = "";
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const itemSubtotal = item.price * item.quantity;
                total += itemSubtotal;
                count += item.quantity;

                const itemElement = document.createElement("div");
                itemElement.classList.add("cart-item");
                itemElement.innerHTML = `
                    <div>
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} c/u</div>
                    </div>
                    <div class="cart-controls">
                        <button class="cart-btn-qty minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="cart-btn-qty plus" data-id="${item.id}">+</button>
                        <button class="cart-btn-remove" data-id="${item.id}">Quitar</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }

        cartTotalPrice.textContent = `$${total.toFixed(2)}`;
        cartCountBadge.textContent = count;
    }

    cartItemsContainer.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        if (!id) return;

        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex === -1) return;

        if (e.target.classList.contains("plus")) {
            cart[itemIndex].quantity += 1;
        } else if (e.target.classList.contains("minus")) {
            cart[itemIndex].quantity -= 1;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
        } else if (e.target.classList.contains("cart-btn-remove")) {
            cart.splice(itemIndex, 1);
        }

        updateCartUI();
    });

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }

            let message = "Hola *Casa del Deporte*, deseo realizar el siguiente pedido:\n\n";
            let total = 0;

            cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                message += `• ${item.name} x${item.quantity} - $${subtotal.toFixed(2)}\n`;
            });

            message += `\n*Total a pagar: $${total.toFixed(2)}*`;

            const phone = "593985347156";
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            window.open(whatsappUrl, "_blank");
        });
    }

});