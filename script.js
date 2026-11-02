const supportedLanguages = ["en", "am", "om"];
const languageNames = { en: "EN", am: "አማ", om: "OM" };
const languageStorageKey = "kamole-language";
const themeStorageKey = "kamole-theme";

function readPreference(key, fallback) {
    try {
        return localStorage.getItem(key) || fallback;
    } catch {
        return fallback;
    }
}

function savePreference(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // The current selection still applies for this page view when storage is unavailable.
    }
}

let currentLanguage = readPreference(languageStorageKey, "en");
if (!supportedLanguages.includes(currentLanguage)) currentLanguage = "en";

const langToggle = document.getElementById("langToggle");
const langMenu = document.getElementById("langMenu");
const currentLangLabel = document.getElementById("currentLang");
const langOptions = document.querySelectorAll(".lang-option");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const themeToggle = document.getElementById("themeToggle");
const header = document.getElementById("header");
const backToTop = document.getElementById("backToTop");
const toast = document.getElementById("toast");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

document.documentElement.classList.add("reveal-ready");

function applyTranslations(language) {
    const dictionary = translations[language];
    if (!dictionary) return;

    document.documentElement.lang = language;
    document.querySelectorAll("[data-translate]").forEach((element) => {
        const key = element.dataset.translate;
        if (Object.hasOwn(dictionary, key)) element.textContent = dictionary[key];
    });

    currentLangLabel.textContent = languageNames[language];
    langOptions.forEach((option) => {
        const isSelected = option.dataset.lang === language;
        option.classList.toggle("active", isSelected);
        option.setAttribute("aria-current", isSelected ? "true" : "false");
    });
    updateThemeLabel();
    updateNavigationLabel();
    updateOpenStatus();
}

function setLanguage(language) {
    if (!supportedLanguages.includes(language) || language === currentLanguage) {
        closeLanguageMenu();
        return;
    }
    currentLanguage = language;
    savePreference(languageStorageKey, language);
    applyTranslations(language);
    closeLanguageMenu();
}

function closeLanguageMenu() {
    langMenu.hidden = true;
    langToggle.setAttribute("aria-expanded", "false");
}

langToggle.addEventListener("click", () => {
    const isOpening = langMenu.hidden;
    langMenu.hidden = !isOpening;
    langToggle.setAttribute("aria-expanded", String(isOpening));
});

langOptions.forEach((option) => {
    option.addEventListener("click", () => setLanguage(option.dataset.lang));
});

document.addEventListener("click", (event) => {
    if (!langMenu.hidden && !langToggle.contains(event.target) && !langMenu.contains(event.target)) {
        closeLanguageMenu();
    }
});

function updateNavigationLabel() {
    const dictionary = translations[currentLanguage];
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-label", dictionary[isOpen ? "nav_close" : "nav_open"]);
}

function setNavigationOpen(isOpen) {
    navMenu.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    const icon = navToggle.querySelector("i");
    icon.classList.toggle("fa-bars", !isOpen);
    icon.classList.toggle("fa-xmark", isOpen);
    updateNavigationLabel();
}

navToggle.addEventListener("click", () => {
    setNavigationOpen(navToggle.getAttribute("aria-expanded") !== "true");
});

navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavigationOpen(false));
});

document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
        setNavigationOpen(false);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeLanguageMenu();
        setNavigationOpen(false);
    }
});

function updateThemeLabel() {
    const dictionary = translations[currentLanguage];
    const isDark = document.body.classList.contains("dark-mode");
    themeToggle.setAttribute("aria-label", dictionary[isDark ? "theme_light" : "theme_dark"]);
}

function setTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    themeColorMeta.setAttribute("content", isDark ? "#17120f" : "#fffcf6");
    const icon = themeToggle.querySelector("i");
    icon.classList.toggle("fa-moon", !isDark);
    icon.classList.toggle("fa-sun", isDark);
    savePreference(themeStorageKey, isDark ? "dark" : "light");
    updateThemeLabel();
}

themeToggle.addEventListener("click", () => {
    setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
});

function updateScrollUI() {
    const scrollY = window.scrollY;
    header.classList.toggle("scrolled", scrollY > 20);
    backToTop.classList.toggle("show", scrollY > 500);
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
});

const navLinks = [...document.querySelectorAll(".nav-link")];
const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                link.classList.toggle("active", link.hash === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: "-30% 0px -58% 0px", threshold: 0 });
    navSections.forEach((section) => sectionObserver.observe(section));

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
    } else {
        document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    }
} else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) setNavigationOpen(false);
});

const openingHours = {
    0: { open: 8 * 60, close: 21 * 60 },
    1: { open: 7 * 60, close: 20 * 60 },
    2: { open: 7 * 60, close: 20 * 60 },
    3: { open: 7 * 60, close: 20 * 60 },
    4: { open: 7 * 60, close: 20 * 60 },
    5: { open: 7 * 60, close: 20 * 60 },
    6: { open: 8 * 60, close: 21 * 60 }
};

function updateOpenStatus() {
    const status = document.getElementById("openStatus");
    if (!status) return;

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Addis_Ababa",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    });
    const parts = Object.fromEntries(formatter.formatToParts(new Date()).map(({ type, value }) => [type, value]));
    const dayNumbers = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const today = openingHours[dayNumbers[parts.weekday]];
    const currentMinutes = Number(parts.hour) * 60 + Number(parts.minute);
    const isOpen = currentMinutes >= today.open && currentMinutes < today.close;

    status.textContent = translations[currentLanguage][isOpen ? "status_open" : "status_closed"];
    status.parentElement.classList.toggle("is-open", isOpen);
    status.parentElement.classList.toggle("is-closed", !isOpen);
}

window.setInterval(updateOpenStatus, 60_000);
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateOpenStatus();
});

let toastTimeout;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 4500);
}

const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    if (!name || !email || !message) {
        showToast(translations[currentLanguage].form_required);
        return;
    }

    const subject = encodeURIComponent(`Message for Kamole Coffee House from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:bilalmuktar192@gmail.com?subject=${subject}&body=${body}`;
});

document.getElementById("currentYear").textContent = String(new Date().getFullYear());

setTheme(readPreference(themeStorageKey, "light"));
applyTranslations(currentLanguage);
updateScrollUI();
