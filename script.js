"use strict";

/*=========================
    FAQ — ПОКАЗАТЬ/СКРЫТЬ
=========================*/

const faqToggleBtn = document.getElementById("faqToggleBtn");
const faqSection = document.querySelector(".faq");
const faqBox = faqSection ? faqSection.querySelector(".faq-box") : null;

if (faqToggleBtn && faqSection && faqBox) {
    faqToggleBtn.addEventListener("click", () => {
        const isOpen = faqBox.style.display === "grid";

        if (isOpen) {
            faqBox.style.display = "none";
            faqSection.classList.remove("faq-open");
            faqToggleBtn.textContent = "Смотреть вопросы";
        } else {
            faqBox.style.display = "grid";
            faqSection.classList.add("faq-open");
            faqToggleBtn.textContent = "Скрыть вопросы";
            faqBox.querySelectorAll(".faq-item").forEach(item => {
                item.classList.add("visible");
            });
        }
    });
}

/*=========================
    ГАЛЕРЕЯ НА ГЛАВНОЙ — ПОКАЗАТЬ ВСЕ ФОТО
=========================*/

const momentsToggle = document.getElementById("momentsToggle");
const momentsGrid = document.getElementById("momentsGrid");

if (momentsToggle && momentsGrid) {
    const momentsExtra = momentsGrid.querySelectorAll(".moment[data-extra]");
    let momentsOpen = false;

    momentsToggle.addEventListener("click", () => {
        momentsOpen = !momentsOpen;
        momentsExtra.forEach(el => el.classList.toggle("gal-hidden", !momentsOpen));
        momentsToggle.textContent = momentsOpen ? "Скрыть фото" : "Смотреть все фото";

        if (!momentsOpen) {
            const section = document.getElementById("moments");
            if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
}

/*=========================
    ГАЛЕРЕЯ — ВИДЕО С КНОПКОЙ PLAY ПОВЕРХ ОБЛОЖКИ
=========================*/

const momentVideoBox = document.getElementById("momentVideo");
const momentPlayBtn = document.getElementById("momentPlay");

if (momentVideoBox && momentPlayBtn) {
    const momentVideo = momentVideoBox.querySelector("video");

    if (momentVideo) {
        // Пока не нажали play — родные кнопки плеера скрыты, видна только обложка
        momentVideo.removeAttribute("controls");

        momentPlayBtn.addEventListener("click", () => {
            momentVideo.setAttribute("controls", "");
            momentVideo.play();
        });

        momentVideo.addEventListener("play", () => {
            momentVideoBox.classList.add("is-playing");
            momentVideo.setAttribute("controls", "");
        });
        momentVideo.addEventListener("pause", () => {
            if (!momentVideo.ended) return;
            momentVideoBox.classList.remove("is-playing");
        });
        momentVideo.addEventListener("ended", () => {
            momentVideoBox.classList.remove("is-playing");
            momentVideo.removeAttribute("controls");
        });
    }
}

/*=========================
    МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
=========================*/

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener("click", () => {
        burgerBtn.classList.toggle("active");
        mobileMenu.classList.toggle("open");
        document.body.classList.toggle("menu-open");
    });

    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            burgerBtn.classList.remove("active");
            mobileMenu.classList.remove("open");
            document.body.classList.remove("menu-open");
        });
    });
}

/*=========================
    ПОКАЗАТЬ СКРЫТЫЕ КАРТОЧКИ
=========================*/

const cards = document.querySelectorAll(".nonecard");

function dispcard() {
    cards.forEach(card => {
        card.style.display = "block";
    });
}

/*=========================
        ОТЗЫВЫ
=========================*/

// Запасные отзывы по умолчанию (если reviews.json еще не создан)
let reviews = [];

let currentReview = 0;

function initReviews() {
    const reviewCard = document.getElementById("reviewCard") || document.querySelector(".review-card");
    if (!reviewCard) return;

    const reviewNav = document.getElementById("reviewNav");
    const reviewDotsWrap = document.getElementById("reviewDots");

    // Отзывов ещё нет — оставляем заглушку, прячем навигацию и точки
    if (!reviews.length) {
        if (reviewNav) reviewNav.style.display = "none";
        if (reviewDotsWrap) reviewDotsWrap.style.display = "none";
        return;
    }

    // Строим точки заново под реальное количество отзывов
    if (reviewDotsWrap) {
        reviewDotsWrap.innerHTML = reviews.map((_, i) => `<span class="dot${i === 0 ? " active" : ""}"></span>`).join("");
        reviewDotsWrap.style.display = reviews.length > 1 ? "flex" : "none";
    }
    if (reviewNav) {
        reviewNav.style.display = reviews.length > 1 ? "flex" : "none";
    }

    const dots = reviewDotsWrap ? reviewDotsWrap.querySelectorAll(".dot") : [];

    function showReview() {
        reviewCard.classList.add("fade");

        setTimeout(() => {
            const r = reviews[currentReview];
            if (r) {
                reviewCard.innerHTML = `
                    <img class="review-photo" src="${r.photo || 'photo/client.png'}" alt="${r.name || 'Клиент'}">
                    <h3 class="review-name">${r.name || 'Аноним'}</h3>
                    <div class="review-stars">${'★'.repeat(Math.min(5, Math.max(1, Number(r.rating) || 5)))}</div>
                    <p class="review-text">${r.text || ''}</p>
                `;
            }

            dots.forEach(dot => dot.classList.remove("active"));
            if (dots[currentReview]) {
                dots[currentReview].classList.add("active");
            }

            reviewCard.classList.remove("fade");
        }, 300);
    }

    const nextReview = document.querySelector(".review-next");
    const prevReview = document.querySelector(".review-prev");

    if (nextReview) {
        nextReview.onclick = () => {
            currentReview++;
            if (currentReview >= reviews.length) {
                currentReview = 0;
            }
            showReview();
        };
    }

    if (prevReview) {
        prevReview.onclick = () => {
            currentReview--;
            if (currentReview < 0) {
                currentReview = reviews.length - 1;
            }
            showReview();
        };
    }

    currentReview = 0;
    showReview();
}

// Загрузка динамических отзывов
async function loadReviews() {
    try {
        // cache: 'no-store' + случайный параметр — чтобы браузer не показывал
        // старую (закэшированную) версию reviews.json после отправки нового отзыва
        const response = await fetch('reviews.json?t=' + Date.now(), { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                reviews = data;
                currentReview = 0; // Сбрасываем на первый отзыв
                renderReviewGrid(data); // Обновляем сетку отзывов на странице review.html
            }
        }
    } catch (error) {
        console.warn("Файл reviews.json пока не найден, используются дефолтные отзывы.");
    } finally {
        initReviews();
    }
}

// Отрисовка сетки отзывов на странице review.html из reviews.json
function renderReviewGrid(list) {
    const grid = document.querySelector('.reviewGrid');
    if (!grid || !Array.isArray(list) || list.length === 0) return;

    const initialCount = 4;

    grid.innerHTML = list.map((r, i) => {
        const ratingNum = Math.min(5, Math.max(1, Number(r.rating) || 5));
        const starsHtml = '★'.repeat(ratingNum) + '☆'.repeat(5 - ratingNum);
        const hiddenClass = i >= initialCount ? ' review-hidden' : '';
        return `
      <div class="reviewItem fade-in show${hiddenClass}">
        <img src="${r.photo || 'photo/client.png'}" alt="${r.name || 'Клиент'}">
        <h3>${r.name || 'Аноним'}</h3>
        <div class="stars">${starsHtml}</div>
        <p>${r.text || ''}</p>
      </div>`;
    }).join('');

    let moreBtnWrap = document.getElementById('reviewsMoreWrap');

    if (list.length > initialCount) {
        if (!moreBtnWrap) {
            moreBtnWrap = document.createElement('div');
            moreBtnWrap.id = 'reviewsMoreWrap';
            moreBtnWrap.style.cssText = 'display:flex;justify-content:center;margin-top:40px;';
            moreBtnWrap.innerHTML = '<button type="button" id="reviewsMoreBtn" class="btn8">Смотреть все отзывы</button>';
            grid.insertAdjacentElement('afterend', moreBtnWrap);

            document.getElementById('reviewsMoreBtn').addEventListener('click', function () {
                const isExpanded = this.dataset.expanded === 'true';
                grid.querySelectorAll('.review-hidden').forEach(el => {
                    el.classList.toggle('review-hidden', isExpanded);
                });
                this.dataset.expanded = isExpanded ? 'false' : 'true';
                this.textContent = isExpanded ? 'Смотреть все отзывы' : 'Скрыть';
            });
        }
        moreBtnWrap.style.display = 'flex';
    } else if (moreBtnWrap) {
        moreBtnWrap.style.display = 'none';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", loadReviews);
} else {
    loadReviews();
}

/*=========================
        АВТОМОБИЛИ
=========================*/

const cars = [
{
title:"Mercedes Sprinter",
subtitle:"VIP микроавтобус",
desc:"Комфортный транспорт для больших компаний.",
img:"photo/sprinter.png",

passengers:"19",
luggage:"600 л",
engine:"VIP-салон",
climate:"Климат-контроль, USB",

gallery:[
"photo/salonsprinter1.jpeg",
"photo/salonsprinter2.jpg",
"photo/salonsprinter3.jpg",
"photo/salonsprinter4.jpg"
],

galleryTitles:[
"Салон",
"Капитанские кресла",
"TV и мультимедиа",
"Багажное отделение"
]
},

{
title:"Mercedes-Benz V-Class",
subtitle:"Премиальный минивэн",
desc:"Просторный салон для делегаций и групповых поездок.",
img:"photo/vclass.png",

passengers:"7",
luggage:"5 чемоданов",
engine:"Капитанские кресла",
climate:"Климат-контроль, USB",

gallery:[
"photo/salonvclass1.jpg",
"photo/salonvclass2.jpg",
"photo/salonvclass3.jpg",
"photo/salonvclass4.jpeg"
],

galleryTitles:[
"VIP-салон",
"Второй ряд",
"Мультимедиа",
"Багажное отделение"
]
},

{
title:"Mercedes-Benz S-Class W222",
subtitle:"Представительский седан",
desc:"Максимальный комфорт для деловых поездок, трансферов и индивидуальных маршрутов.",
img:"photo/sclass.png",

passengers:"3",
luggage:"3 чемодана",
engine:"Массаж сидений",
climate:"Климат-контроль, USB",

gallery:[
"photo/salon2221.jpg",
"photo/salon2222.jpg",
"photo/salon2223.jpg",
"photo/salon2224.jpg"
],

galleryTitles:[
"Передний салон",
"Задний ряд",
"Панель управления",
"Атмосферная подсветка"
]
},

{
title:"Mercedes-Benz S-Class W223",
subtitle:"Флагман нового поколения",
desc:"Современный бизнес-класс с максимальным уровнем комфорта.",
img:"photo/w2231.png",

passengers:"3",
luggage:"3 чемодана",
engine:"Массаж сидений",
climate:"4-зонный климат, USB",

gallery:[
"photo/salon2231.jpg",
"photo/salon2232.jpg",
"photo/salon2233.jpg",
"photo/salon2234.jpg"
],

galleryTitles:[
"Передний салон",
"Executive Rear",
"MBUX Hyperscreen",
"Панорамная крыша"
]
}
];

let currentCar = 0;

function selectCar(index){
if(!document.getElementById("heroCar")) return;

const car = cars[index];
const hero = document.getElementById("heroCar");

hero.classList.add("fade");

setTimeout(()=>{
hero.src = car.img;

document.getElementById("carTitle").textContent = car.title;
document.getElementById("carSubtitle").textContent = car.subtitle;
document.getElementById("carDesc").textContent = car.desc;

document.getElementById("passengers").textContent = car.passengers;
document.getElementById("luggage").textContent = car.luggage;
document.getElementById("engine").textContent = car.engine;
document.getElementById("climate").textContent = car.climate;

document.getElementById("current").textContent = (index+1).toString().padStart(2,"0");

document.querySelectorAll(".car-mini").forEach(card=>{
card.classList.remove("active");
});

if(document.querySelectorAll(".car-mini")[index]){
document.querySelectorAll(".car-mini")[index].classList.add("active");
}

const gallery = document.querySelectorAll(".gallery-item img");
car.gallery.forEach((img,i)=>{
    if(gallery[i]){
        gallery[i].src = img;
    }
});

hero.classList.remove("fade");
currentCar = index;
},300);
}

/*=========================
    ПЕРЕКЛЮЧЕНИЕ АВТОМОБИЛЕЙ
=========================*/

const rightArrow = document.querySelector(".arrow-right");
const leftArrow = document.querySelector(".arrow-left");

if(rightArrow){
rightArrow.onclick = ()=>{
currentCar++;
if(currentCar >= cars.length){
    currentCar = 0;
}
selectCar(currentCar);
};
}

if(leftArrow){
leftArrow.onclick = ()=>{
currentCar--;
if(currentCar < 0){
    currentCar = cars.length - 1;
}
selectCar(currentCar);
};
}

const heroCar = document.getElementById("heroCar");
if(heroCar){
let startX = 0;
heroCar.addEventListener("touchstart",e=>{
    startX = e.touches[0].clientX;
});
heroCar.addEventListener("touchend",e=>{
    let endX = e.changedTouches[0].clientX;
    if(startX-endX>60){
        currentCar++;
        if(currentCar>=cars.length){
            currentCar=0;
        }
        selectCar(currentCar);
    }
    if(endX-startX>60){
        currentCar--;
        if(currentCar<0){
            currentCar=cars.length-1;
        }
        selectCar(currentCar);
    }
});
}

/*=========================
        ЛАЙТБОКС И КЛАВИАТУРА
=========================*/

let lightbox, lbImg;
let currentIndex = 0;
let currentGalleryImages = [];

function initLightbox() {
    lightbox = document.getElementById('lightbox') || document.querySelector('.lb');
    lbImg = document.getElementById('lbimg') || document.querySelector('.lb img');
    const closeBtn = document.querySelector('.lb-close');
    const prevBtn = document.querySelector('.lb-prev');
    const nextBtn = document.querySelector('.lb-next');

    if (!lightbox || !lbImg) return;

    function updateLightboxImg(index) {
        lbImg.classList.remove('show');
        setTimeout(() => {
            currentIndex = index;
            if (currentGalleryImages[currentIndex]) {
                lbImg.src = currentGalleryImages[currentIndex];
            }
            lbImg.classList.add('show');
        }, 200); 
    }

    // Фото салона на странице автопарка + фото галереи на главной
    const LB_SELECTOR = '.gallery-item img, .moment img';
    document.querySelectorAll(LB_SELECTOR).forEach((img) => {
        img.addEventListener('click', () => {
            if (img.classList.contains('is-missing')) return;
            const imgs = Array.from(document.querySelectorAll(LB_SELECTOR))
                .filter(el => !el.classList.contains('is-missing'));
            currentGalleryImages = imgs.map(el => el.src);
            lightbox.classList.add('active');
            updateLightboxImg(imgs.indexOf(img));
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentGalleryImages.length === 0) return;
            let newIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateLightboxImg(newIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentGalleryImages.length === 0) return;
            let newIndex = (currentIndex + 1) % currentGalleryImages.length;
            updateLightboxImg(newIndex);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            lightbox.classList.remove('active');
            lbImg.classList.remove('show');
        });
    }

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            lbImg.classList.remove('show');
        }
    });

    document.addEventListener("keydown", e => {
        if (!lightbox || !lightbox.classList.contains("active")) return;

        if (e.key === "Escape") {
            lightbox.classList.remove("active");
            lbImg.classList.remove('show');
        }

        if (e.key === "ArrowRight") {
            if (currentGalleryImages.length === 0) return;
            let newIndex = (currentIndex + 1) % currentGalleryImages.length;
            updateLightboxImg(newIndex);
        }

        if (e.key === "ArrowLeft") {
            if (currentGalleryImages.length === 0) return;
            let newIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateLightboxImg(newIndex);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initLightbox);
} else {
    initLightbox();
}

/*=========================
    ОТКРЫТИЕ АВТО ИЗ URL
=========================*/

const params = new URLSearchParams(window.location.search);
const carParam = params.get("car");

if(carParam !== null){
selectCar(Number(carParam));
}

/*=========================
        МОДАЛЬНОЕ ОКНО
=========================*/

const modal = document.querySelector(".modal");
const orderBtn = document.querySelector(".order");
const closeModal = document.querySelector(".close");

if(modal && orderBtn){
orderBtn.onclick=(e)=>{
e.preventDefault();
modal.style.display="flex";
};
}

if(modal && closeModal){
closeModal.onclick=()=>{
modal.style.display="none";
};
}

if(modal){
modal.onclick=(e)=>{
if(e.target === modal){
modal.style.display="none";
}
};
}

/*=========================
        АНИМАЦИИ
=========================*/

const animateElements = document.querySelectorAll(
".service2, .premium-box div, .clients-box div, .trust-card, .stepsbox div, .faq-item, .number-card, .video-box, .seo-text, .adv-card, .car-mini, .gallery-item"
);

if(animateElements.length){
const observer = new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("fade-element");
setTimeout(()=>{
entry.target.classList.add("show");
},100);
observer.unobserve(entry.target);
}
});
},{
threshold:0.15
});

animateElements.forEach(el=>{
observer.observe(el);
});
}

/*=========================
        СЧЕТЧИКИ
=========================*/

const numberCards = document.querySelectorAll(".number-card");

if (numberCards.length) {
    const numberObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const number = entry.target.querySelector("h2");
                if (!number) return;

                if (!number.hasAttribute("data-count")) {
                    numberObserver.unobserve(entry.target);
                    return;
                }

                const target = Number(number.dataset.count);
                let start = null;

                function animate(timestamp) {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const value = Math.min(
                        Math.floor(progress / 2000 * target),
                        target
                    );

                    if (target === 24) {
                        number.textContent = value + "/7";
                    } else if (target === 50000) {
                        number.textContent = value.toLocaleString("ru-RU") + "+";
                    } else {
                        number.textContent = value + "+";
                    }

                    if (value < target) {
                        requestAnimationFrame(animate);
                    }
                }

                requestAnimationFrame(animate);
                numberObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.4
    });

    numberCards.forEach(card => {
        numberObserver.observe(card);
    });
}

/*=========================
        RIPPLE
=========================*/

document.querySelectorAll(".btn,.herobtn,.order,.btn8,.reviewbtn a")
.forEach(button => {
    button.addEventListener("click", function (e) {
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = e.offsetX + "px";
        ripple.style.top = e.offsetY + "px";
        this.append(ripple);
        setTimeout(() => {
            ripple.remove();
        }, 700);
    });
});

/*==================================================
    УНИВЕРСАЛЬНОЕ ПЛАВНОЕ ПОЯВЛЕНИЕ ДЛЯ ВСЕГО САЙТА
==================================================*/

function initFadeIn() {
    const fadeElements = document.querySelectorAll(".fade-in");
    if (fadeElements.length === 0) return; 

    const parentMap = new Map();
    fadeElements.forEach(el => {
        const parent = el.parentElement;
        if (!parentMap.has(parent)) {
            parentMap.set(parent, []);
        }
        parentMap.get(parent).push(el);
    });

    parentMap.forEach(children => {
        if (children.length > 1) {
            children.forEach((child, index) => {
                const delay = (index % 5) * 0.1;
                child.style.transitionDelay = `${delay}s`;
            });
        }
    });

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1 
    });

    fadeElements.forEach(el => scrollObserver.observe(el));
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initFadeIn);
} else {
    initFadeIn();
}

/*=========================
    МАСКА ДЛЯ ТЕЛЕФОНОВ
=========================*/

document.querySelectorAll('input[type="tel"]').forEach(phoneInput => {
    phoneInput.addEventListener("input", function () {
        let value = this.value.replace(/\D/g, "");

        if (value.startsWith("8")) value = "7" + value.slice(1);
        if (!value.startsWith("7") && value.length > 0) value = "7" + value;

        value = value.substring(0, 11);

        let result = "+7";
        if (value.length > 1) result += " (" + value.substring(1, 4);
        if (value.length >= 4) result += ") " + value.substring(4, 7);
        if (value.length >= 7) result += "-" + value.substring(7, 9);
        if (value.length >= 9) result += "-" + value.substring(9, 11);

        this.value = result;
    });

    phoneInput.addEventListener("keydown", function (e) {
        const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
        if (allowed.includes(e.key) || (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))) {
            return;
        }
        if (!/\d/.test(e.key)) {
            e.preventDefault();
        }
    });
});

/*=========================
    ФОРМА ЗАКАЗА (МОДАЛКА)
=========================*/

const form = document.getElementById("orderForm");

if(form) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const name = formData.get("name");
        const phone = formData.get("phone");
        const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

        if (cleanPhone.length !== 11) {
            alert("Введите номер полностью!");
            const input = form.querySelector('input[type="tel"]');
            if (input) input.focus();
            return;
        }

        const carTitleElement = document.getElementById("carTitle");
        const carName = carTitleElement ? carTitleElement.innerText : "Не указано";

        const text = `Автомобиль: ${carName}`;

        fetch('send.php', {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ type: "lead", name: name, phone: `+${cleanPhone}`, text: text })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                form.style.display = "none";
                let successMsg = document.getElementById("formSuccessMessage");
                if (!successMsg) {
                    successMsg = document.createElement("div");
                    successMsg.id = "formSuccessMessage";
                    successMsg.style.cssText = "padding: 20px; text-align: center; font-size: 18px; color: #28a745; font-weight: bold;";
                    form.parentNode.insertBefore(successMsg, form);
                }
                successMsg.innerText = "Спасибо! Ваша заявка успешно отправлена.";
                form.reset();
            } else {
                alert("Ошибка отправки. Попробуйте еще раз.");
            }
        })
        .catch(error => {
            console.error("Ошибка:", error);
            alert("Ошибка соединения с сервером.");
        });
    });
}

/*==========================
      ФОРМА ОТЗЫВА
==========================*/

const reviewForm = document.getElementById('reviewForm');
const REVIEW_FLAG_KEY = 'transfer990_review_submitted';

function showReviewThankYou() {
    if (!reviewForm) return;
    reviewForm.innerHTML = '<p style="color:#d4a45f;text-align:center;font-size:18px;font-weight:600;">Спасибо! Вы уже оставили отзыв — повторно оставить отзыв с этого устройства нельзя.</p>';
}

if (reviewForm) {
    if (localStorage.getItem(REVIEW_FLAG_KEY) === 'true') {
        showReviewThankYou();
    } else {
        reviewForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nameVal = document.getElementById('name')?.value || '';
            const textVal = document.getElementById('text')?.value || '';
            const ratingInput = document.getElementById('rating');
            const ratingVal = ratingInput ? ratingInput.value : '5';

            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerText : '';
            if (submitBtn) {
                submitBtn.innerText = 'Отправка...';
                submitBtn.disabled = true;
            }

            fetch('send.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({ type: 'review', name: nameVal, text: textVal, rating: ratingVal })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    localStorage.setItem(REVIEW_FLAG_KEY, 'true');
                    loadReviews(); // Перезагружаем отзывы сразу после публикации
                    showReviewThankYou();
                } else if (data.message && data.message.indexOf('уже оставляли') !== -1) {
                    localStorage.setItem(REVIEW_FLAG_KEY, 'true');
                    showReviewThankYou();
                } else {
                    alert(data.message || 'Ошибка при отправке.');
                    if (submitBtn) {
                        submitBtn.innerText = originalText;
                        submitBtn.disabled = false;
                    }
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Произошла ошибка соединения с сервером.');
                if (submitBtn) {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            });
        });
    }
}

/*==========================
      ЗВЁЗДНЫЙ РЕЙТИНГ
==========================*/

const stars = document.querySelectorAll(".rating .star");
const ratingInput = document.getElementById("rating");

if(stars.length && ratingInput){
    stars.forEach(star=>{
        star.addEventListener("click",()=>{
            const value = star.dataset.value;
            ratingInput.value = value;

            stars.forEach(s=>{
                s.classList.toggle("active", s.dataset.value <= value);
            });
        });
    });
}

/*==========================
      КАЛЬКУЛЯТОР ЦЕН
==========================*/

const mainlandPrices = {
    "Краснодар": 45000, "Анапа": 50000, "Новороссийск": 60000, "Геленджик": 65000,
    "Туапсе": 70000, "Сочи": 80000, "Ростов-на-Дону": 65000, "Астрахань": 130000,
    "Элиста": 120000, "Ставрополь": 115000, "Пятигорск": 120000, "Минеральные Воды": 120000,
    "Воронеж": 150000, "Брянск": 160000, "Тула": 150000, "Москва": 180000,
    "Нижний Новгород": 200000, "Казань": 210000, "Псков": 240000, "Санкт-Петербург": 270000
};

const localCrimeaPrices = {
    "Симферополь": 4000, "Ялта": 12000, "Севастополь": 12000, "Евпатория": 10000,
    "Алушта": 10000, "Бахчисарай": 10000, "Феодосия": 15000, "Судак": 10000,
    "Джанкой": 10000, "Армянск": 15000, "Керчь": 20000
};

const calcBtn = document.getElementById("calcBtn");

if(calcBtn){
    calcBtn.onclick = () => {
        const fromInput = document.getElementById("from");
        const toInput = document.getElementById("to");
        const carSelect = document.getElementById("car");
        const result = document.getElementById("priceResult");

        if(!toInput || !result) return;

        const from = fromInput ? fromInput.value.trim() : "";
        const to = toInput.value.trim();
        const carFactor = carSelect ? Number(carSelect.value) : 1; 

        if(!to){
            result.innerHTML = "Пожалуйста, выберите город назначения (Куда).";
            result.classList.add("show");
            return;
        }

        let basePrice = 0;
        if (mainlandPrices[to]) {
            basePrice = mainlandPrices[to];
        } else if (localCrimeaPrices[to]) {
            basePrice = localCrimeaPrices[to];
        } else {
            basePrice = 70000;
        }

        let price = basePrice * carFactor;

        if(mainlandPrices[to] && from && from.toLowerCase() !== "симферополь"){
            price += 4000;
        }

        price = Math.round(price);

        result.innerHTML = `
            <h3>Примерная стоимость</h3>
            <span>${price.toLocaleString("ru-RU")} ₽</span>
            <p>Точная стоимость рассчитывается менеджером после уточнения маршрута.</p>
        `;
        result.classList.add("show");
    };
}

/*==========================
      TOAST И БОКОВАЯ ФОРМА
==========================*/

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.innerText = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nameVal = bookingForm.querySelector('[name="name"]')?.value || '';
        const phoneVal = bookingForm.querySelector('[name="phone"]')?.value || '';

        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerText : '';
        if (submitBtn) {
            submitBtn.innerText = 'Отправка...';
            submitBtn.disabled = true;
        }

        fetch('send.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ name: nameVal, phone: phoneVal })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showToast('Спасибо! Заявка успешно отправлена.');
                bookingForm.reset();
            } else {
                showToast('Ошибка при отправке. Попробуйте еще раз.', true);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showToast('Ошибка соединения с сервером.', true);
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    });
}