document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       LINGUA (IT / EN)
       L'italiano è nel markup; l'inglese sta negli attributi data-en*.
       ========================================== */
    const LANG_KEY = "fd-lang";
    const translatable = document.querySelectorAll("[data-en]");
    const attrPairs = [["alt", "data-en-alt"], ["aria-label", "data-en-aria-label"]];
    const italianAttrs = new Map();

    // Salva l'italiano originale prima di qualsiasi cambio
    translatable.forEach(el => { el.dataset.it = el.innerHTML; });
    attrPairs.forEach(([attr, source]) => {
        const saved = new Map();
        document.querySelectorAll(`[${source}]`).forEach(el => saved.set(el, el.getAttribute(attr) || ""));
        italianAttrs.set(attr, saved);
    });

    const titles = {
        it: document.title,
        en: document.documentElement.dataset.titleEn || document.title,
    };

    function setLanguage(lang) {
        const en = lang === "en";
        document.documentElement.lang = lang;
        document.title = titles[lang];

        translatable.forEach(el => {
            el.innerHTML = en ? el.dataset.en : el.dataset.it;
        });
        attrPairs.forEach(([attr, source]) => {
            italianAttrs.get(attr).forEach((italian, el) => {
                el.setAttribute(attr, en ? el.getAttribute(source) : italian);
            });
        });
        document.querySelectorAll(".lang-switch button").forEach(btn => {
            btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
        });

        try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage non disponibile */ }
    }

    document.querySelectorAll(".lang-switch button").forEach(btn => {
        btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
    });

    let savedLang = null;
    try { savedLang = localStorage.getItem(LANG_KEY); } catch (e) { /* storage non disponibile */ }
    if (savedLang === "en") setLanguage("en");

    /* ==========================================
       IL COLORE DELLA PAGINA SEGUE LA LUCE
       Ogni sezione con data-tone cambia lo sfondo quando attraversa il centro dello schermo.
       ========================================== */
    const toneSections = document.querySelectorAll("section[data-tone], footer[data-tone]");
    if ("IntersectionObserver" in window && toneSections.length) {
        const toneObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) document.body.dataset.tone = entry.target.dataset.tone;
            });
        }, { rootMargin: "-50% 0px -50% 0px" });
        toneSections.forEach(section => toneObserver.observe(section));
    }

    /* ==========================================
       LIGHTBOX
       ========================================== */
    const lightbox = document.getElementById("lightbox");
    if (!lightbox || typeof lightbox.showModal !== "function") return;

    const lightboxImg = lightbox.querySelector(".lightbox-img");
    const lightboxCaption = lightbox.querySelector(".lightbox-caption");
    const photos = Array.from(document.querySelectorAll(".photo"));
    let current = 0;

    function show(index) {
        current = (index + photos.length) % photos.length;
        const img = photos[current].querySelector("img");
        const title = photos[current].querySelector(".photo-title");
        const species = photos[current].querySelector(".photo-species");
        // La versione grande è sempre l'ultima del srcset
        const largest = img.srcset.split(",").pop().trim().split(" ")[0];
        lightboxImg.src = largest || img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.innerHTML = `${title.innerHTML}<br><span>${species.innerHTML}</span>`;
    }

    photos.forEach((photo, index) => {
        photo.querySelector(".photo-open").addEventListener("click", () => {
            show(index);
            lightbox.showModal();
        });
    });

    lightbox.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
    lightbox.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
    lightbox.querySelector(".lb-close").addEventListener("click", () => lightbox.close());

    // Chiudi cliccando fuori dalla foto
    lightbox.addEventListener("click", e => {
        if (e.target === lightbox) lightbox.close();
    });

    lightbox.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") show(current - 1);
        if (e.key === "ArrowRight") show(current + 1);
    });

    // Il focus torna alla foto aperta (Esc lo gestisce il dialog nativo)
    lightbox.addEventListener("close", () => {
        photos[current].querySelector(".photo-open").focus();
    });
});
