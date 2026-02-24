// Global Cart State
let cart = [];

// Global Functions
window.addToCart = function (name, price, image, btnElement) {
    console.log("Adding to cart:", name);

    // Check if item exists
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }

    updateCartUI();

    // Visual Feedback (Silent Add)
    // If the button element is passed (we need to update HTML to pass 'this')
    // For now, let's assume we can find the button or use a generic notification.
    // Since we didn't update HTML yet, let's try to find the button by text/context or just use a toast.
    // Actually, simpler: The user clicked a button. We can't easily get reference unless we update HTML onclick.
    // Let's update HTML onclick to pass 'this' in the next step.

    // Dispatch custom event for potential toast
    const event = new CustomEvent('cart-updated');
    window.dispatchEvent(event);
};

window.changeQuantity = function (index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    }
    updateCartUI();
};

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    updateCartUI();
};

window.openCart = function () {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeCart = function () {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const orderDetails = document.getElementById('order-details');

    // Calculate total items count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Update count badge
    if (cartCount) cartCount.textContent = totalItems;

    // Render items
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Din varukorg är tom.</p>';
            if (cartTotalPrice) cartTotalPrice.textContent = '0 kr';
            if (orderDetails) orderDetails.value = '';
            return;
        }

        console.log(`Rendering ${cart.length} items to cart.`);

        cart.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            // Ensure controls have a wrapper to prevent layout breakage
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price} kr</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <!-- Remove entire item -->
                <div class="remove-item" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    // Calculate Total with "2 for 199" Logic
    const total = calculateTotal(totalItems);
    if (cartTotalPrice) cartTotalPrice.textContent = `${total} kr`;

    // Populate hidden textarea for form submission
    // Populate hidden textarea for form submission
    if (orderDetails) {
        let orderSummary = "BESTÄLLNING:\n";
        cart.forEach(item => {
            orderSummary += `- ${item.name} x${item.quantity} (${item.price * item.quantity} kr)\n`;
        });
        orderSummary += `\nAntal produkter: ${totalItems}`;
        orderSummary += `\nTOTALT PRIS: ${total} kr`;

        orderDetails.value = orderSummary;
    }

    // Save to LocalStorage
    localStorage.setItem('caritasCart', JSON.stringify(cart));

    function calculateTotal(quantity) {
        const pairs = Math.floor(quantity / 2);
        const singles = quantity % 2;
        return (pairs * 199) + (singles * 119);
    }
}

document.addEventListener('click', function (e) {
    if (e.target && e.target.closest('.btn') && e.target.closest('.product-info')) {
        const btn = e.target.closest('.btn');
        const originalText = btn.innerText;
        btn.innerText = "Tillagd!";
        btn.style.backgroundColor = "#4CAF50"; // Green feedback
        setTimeout(() => {
            btn.innerText = "Lägg i varukorg"; // Reset hardcoded text or perform smarter reset
            btn.style.backgroundColor = ""; // Reset color
        }, 1500);
    }
});

// DOM Loaded Event Listener
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded");

    // Load from LocalStorage
    const savedCart = localStorage.getItem('caritasCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartUI();
        } catch (e) {
            console.error("Error loading cart:", e);
            localStorage.removeItem('caritasCart');
        }
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Animate hamburger icon
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Header scroll background effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
        }
    });

    // Animation on Scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card, .vision-card, .team-member').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // Close cart when clicking outside content
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                closeCart();
            }
        });
    }

    // Form Handling (AJAX)
    const contactForm = document.getElementById('contact-form');
    const checkoutForm = document.getElementById('checkout-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            handleFormSubmit(e, 'contact-result');
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (e) {
            handleFormSubmit(e, 'checkout-result', () => {
                cart = [];
                updateCartUI();
                setTimeout(() => {
                    closeCart();
                    // Optional: Reset result message after closing
                    const result = document.getElementById('checkout-result');
                    if (result) result.innerHTML = "";
                }, 3000);
            });
        });
    }

    function handleFormSubmit(e, resultElementId, callback) {
        e.preventDefault();
        const form = e.target;
        const result = document.getElementById(resultElementId);

        if (result) {
            result.innerHTML = "Skickar...";
            result.style.color = "#333";
        }

        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    if (result) {
                        result.innerHTML = "Tack! Ditt meddelande har skickats.";
                        result.style.color = "green";
                    }
                    form.reset();
                    if (callback) callback();
                } else {
                    console.log(response);
                    if (result) {
                        result.innerHTML = json.message;
                        result.style.color = "red";
                    }
                }
            })
            .catch(error => {
                console.log(error);
                if (result) {
                    result.innerHTML = "Något gick fel. Försök igen.";
                    result.style.color = "red";
                }
            });
    }
});
