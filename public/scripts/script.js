document.addEventListener('DOMContentLoaded', function() {
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Форма обратной связи
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Отправка данных на сервер
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Ошибка: ' + data.error);
                } else {
                    alert('Сообщение отправлено! Я свяжусь с вами в ближайшее время.');
                    this.reset();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Произошла ошибка при отправке сообщения.');
            });
        });
    }

    // Мобильное меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                }
            });
        });
        
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navLinks.style.display = 'flex';
            } else {
                navLinks.style.display = 'none';
            }
        });
    }

    // Изменение стиля шапки при скролле
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(44, 62, 80, 0.9)';
            header.style.padding = '0.5rem 0';
        } else {
            header.style.backgroundColor = 'var(--secondary-color)';
            header.style.padding = '1rem 0';
        }
    });

    // Корзина
    const cart = {
        items: [],
        count: 0,
        load: function() {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
                this.count = this.items.reduce((sum, item) => sum + item.quantity, 0);
                this.updateUI();
            }
        },
        addItem: function(product) {
            const existingItem = this.items.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({...product, quantity: 1});
            }
            this.count += 1;
            this.save();
            this.updateUI();
        },
        save: function() {
            localStorage.setItem('cart', JSON.stringify(this.items));
        },
        updateUI: function() {
            document.getElementById('cart-count').textContent = this.count;
            document.getElementById('total-count').textContent = this.count;
            
            const cartItemsEl = document.getElementById('cart-items');
            cartItemsEl.innerHTML = this.items.length === 0 
                ? '<p>Корзина пуста</p>'
                : this.items.map(item => `
                    <div class="cart-item">
                        <img src="${item.img}" alt="${item.title}">
                        <div class="cart-item-info">
                            <h4>${item.title}</h4>
                            <p>${item.tech}</p>
                        </div>
                        <span>${item.quantity} шт.</span>
                    </div>
                `).join('');
        },
        clear: function() {
            this.items = [];
            this.count = 0;
            this.save();
            this.updateUI();
        }
    };

    // Инициализация корзины
    cart.load();

    // Модальные окна
    const cartModal = document.getElementById('cart-modal');
    const productModal = document.getElementById('product-modal');
    const cartBtn = document.getElementById('cart-btn');
    const closeButtons = document.querySelectorAll('.close');
    const clearCartBtn = document.getElementById('clear-cart');

    // Открытие корзины
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cartModal.style.display = 'block';
        });
    }

    // Очистка корзины
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            cart.clear();
        });
    }

    // Закрытие модальных окон
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            cartModal.style.display = 'none';
            productModal.style.display = 'none';
        });
    });

    // Закрытие при клике вне окна
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
    });

    // Продукты портфолио
    const products = [
        {
            id: 1,
            title: "Путешествия по России",
            description: "Сайт о путешествиях по России с информацией о достопримечательностях и маршрутах.",
            tech: "HTML + CSS + JS + Node JS",
            img: "/assets/e6f0b476695ccbd8065ca53c5e9a91d9d8f3750d-1733592143.webp"
        },
        {
            id: 2,
            title: "Магазин техники",
            description: "Интернет-магазин электроники с корзиной и фильтрами товаров.",
            tech: "HTML + CSS + TS + Node JS + REACT",
            img: "/assets/Снимок%20экрана%202025-05-04%20134609.png"
        },
        {
            id: 3,
            title: "Argonia",
            description: "Корпоративный сайт компании Argonia с блогом и формой обратной связи.",
            tech: "HTML + CSS + JS + PHP + WordPress",
            img: "/assets/Снимок%20экрана%202025-05-04%20134653.png"
        },
        {
            id: 4,
            title: "SEO",
            description: "Сайт SEO-агентства с услугами и кейсами.",
            tech: "HTML + CSS + JS + PHP + WordPress",
            img: "/assets/Снимок%20экрана%202025-05-04%20134719.png"
        }
    ];

    // Открытие карточки товара
    document.querySelectorAll('.portfolio-item').forEach((item, index) => {
        item.addEventListener('click', function(e) {
            // Проверяем, что клик не по кнопке
            if (!e.target.classList.contains('btn') && !e.target.closest('.btn')) {
                const product = products[index];
                const productImg = document.getElementById('product-img');
                productImg.src = product.img;
                productImg.alt = product.title;
                document.getElementById('product-title').textContent = product.title;
                document.getElementById('product-description').textContent = product.description;
                document.getElementById('product-tech').textContent = product.tech;
                
                const addToCartBtn = document.getElementById('add-to-cart');
                addToCartBtn.onclick = function() {
                    cart.addItem(product);
                    productModal.style.display = 'none';
                };
                
                productModal.style.display = 'block';
            }
        });
    });

    // Сохранение времени последнего посещения
    function saveLastVisit() {
        const now = new Date();
        localStorage.setItem('lastVisit', now.toString());
        const lastVisitElement = document.getElementById('last-visit');
        if (lastVisitElement) {
            lastVisitElement.textContent = `Последний визит: ${now.toLocaleString()}`;
        }
    }

    // Восстановление времени последнего посещения
    function loadLastVisit() {
        const lastVisit = localStorage.getItem('lastVisit');
        const lastVisitElement = document.getElementById('last-visit');
        if (lastVisitElement) {
            if (lastVisit) {
                const visitDate = new Date(lastVisit);
                lastVisitElement.textContent = `Последний визит: ${visitDate.toLocaleString()}`;
            } else {
                lastVisitElement.textContent = 'Это ваш первый визит!';
            }
        }
    }

    // Инициализация времени посещения
    loadLastVisit();
    saveLastVisit();
});