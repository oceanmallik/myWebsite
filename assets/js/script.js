(function () {
    const THEME_CLASSES = ['theme-cyberpunk', 'theme-white', 'theme-soft', 'theme-aurora', 'theme-black'];
    const THEME_ICONS = ['fa-bolt', 'fa-sun', 'fa-cloud', 'fa-water', 'fa-moon'];
    const THEME_LABELS = ['Cyberpunk', 'White', 'Soft', 'Aurora', 'Black'];

    function getStoredThemeIndex() {
        let storedIndex = parseInt(localStorage.getItem('themeIndex'), 10);
        if (Number.isNaN(storedIndex) || storedIndex < 0 || storedIndex >= THEME_CLASSES.length) {
            storedIndex = 4; // Default to Pitch Black
        }
        return storedIndex;
    }

    function applyBodyTheme(body, index) {
        body.classList.remove(...THEME_CLASSES);
        if (THEME_CLASSES[index]) {
            body.classList.add(THEME_CLASSES[index]);
            document.documentElement.className = THEME_CLASSES[index];
        }
    }

    /* --- Scroll Progress Bar --- */
    function initScrollProgress() {
        const progressBar = document.getElementById('scroll-progress');
        if (!progressBar) return;

        const updateProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    /* --- Back to Top Button --- */
    function initBackToTop() {
        let btn = document.getElementById('back-to-top');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'back-to-top';
            btn.className = 'back-to-top-btn';
            btn.setAttribute('aria-label', 'Scroll back to top');
            btn.setAttribute('title', 'Back to top');
            btn.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
            document.body.appendChild(btn);
        }

        const toggleBtn = () => {
            if (window.scrollY > 350) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
        };

        window.addEventListener('scroll', toggleBtn, { passive: true });
        toggleBtn();

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* --- Modern Mobile Drawer Navigation --- */
    function initMobileMenu() {
        const menuButton = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!menuButton || !mobileMenu) {
            return;
        }

        let overlay = document.getElementById('mobile-menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mobile-menu-overlay';
            overlay.className = 'mobile-menu-overlay';
            document.body.appendChild(overlay);
        }

        const closeButton = document.getElementById('mobile-menu-close');

        const openDrawer = () => {
            mobileMenu.classList.remove('hidden');
            requestAnimationFrame(() => {
                mobileMenu.classList.add('open');
                overlay.classList.add('active');
            });
            document.body.style.overflow = 'hidden';
            menuButton.setAttribute('aria-expanded', 'true');
        };

        const closeDrawer = () => {
            mobileMenu.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            menuButton.setAttribute('aria-expanded', 'false');
            setTimeout(() => {
                if (!mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.add('hidden');
                }
            }, 350);
        };

        menuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (mobileMenu.classList.contains('open')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        if (closeButton) {
            closeButton.addEventListener('click', closeDrawer);
        }

        overlay.addEventListener('click', closeDrawer);

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeDrawer();
            }
        });
    }

    /* --- Theme Switcher --- */
    function initThemeSwitcher() {
        const themeButton = document.getElementById('theme-toggle');
        const body = document.body;

        if (!themeButton) {
            applyBodyTheme(body, getStoredThemeIndex());
            return;
        }

        const themeIcon = themeButton.querySelector('.theme-icon');
        const themeName = themeButton.querySelector('.theme-name');
        const themeListToggleButton = document.getElementById('theme-list-toggle');
        const themeList = document.getElementById('theme-list');
        let currentThemeIndex = getStoredThemeIndex();

        function renderThemeList() {
            if (!themeList) return;
            themeList.innerHTML = '';

            THEME_LABELS.forEach((label, index) => {
                const option = document.createElement('button');
                option.type = 'button';
                option.className = 'theme-list-item';

                if (index === currentThemeIndex) {
                    option.classList.add('active');
                }

                option.setAttribute('role', 'option');
                option.setAttribute('aria-selected', index === currentThemeIndex ? 'true' : 'false');
                option.innerHTML = `<span>${label}</span><i class="fas ${THEME_ICONS[index]}"></i>`;

                option.addEventListener('click', () => {
                    currentThemeIndex = index;
                    applyTheme(currentThemeIndex, true);
                    closeThemeList();
                });

                themeList.appendChild(option);
            });
        }

        function closeThemeList() {
            if (!themeList || !themeListToggleButton) return;
            themeList.classList.add('hidden');
            themeListToggleButton.classList.remove('open');
            themeListToggleButton.setAttribute('aria-expanded', 'false');
        }

        function toggleThemeList() {
            if (!themeList || !themeListToggleButton) return;
            const isOpen = !themeList.classList.contains('hidden');

            if (isOpen) {
                closeThemeList();
                return;
            }

            renderThemeList();
            themeList.classList.remove('hidden');
            themeListToggleButton.classList.add('open');
            themeListToggleButton.setAttribute('aria-expanded', 'true');
        }

        function applyTheme(index, shouldFade = true) {
            const normalizedIndex = index >= 0 && index < THEME_CLASSES.length ? index : 0;

            const updateTheme = () => {
                applyBodyTheme(body, normalizedIndex);

                if (themeIcon) {
                    themeIcon.className = `fas ${THEME_ICONS[normalizedIndex]}`;
                }

                if (themeName) {
                    themeName.textContent = THEME_LABELS[normalizedIndex];
                }

                renderThemeList();

                try {
                    localStorage.setItem('themeIndex', String(normalizedIndex));
                } catch (error) {
                    // Ignore storage errors in private browsing
                }
            };

            if (!shouldFade) {
                updateTheme();
                return;
            }

            body.classList.add('theme-fading');
            requestAnimationFrame(() => {
                updateTheme();
                setTimeout(() => body.classList.remove('theme-fading'), 280);
            });
        }

        applyTheme(currentThemeIndex, false);

        themeButton.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % THEME_CLASSES.length;
            applyTheme(currentThemeIndex, true);
            closeThemeList();
        });

        if (themeListToggleButton) {
            themeListToggleButton.addEventListener('click', (event) => {
                event.stopPropagation();
                toggleThemeList();
            });
        }

        document.addEventListener('click', (event) => {
            if (
                themeList &&
                !themeList.classList.contains('hidden') &&
                !themeButton.contains(event.target) &&
                (!themeListToggleButton || !themeListToggleButton.contains(event.target)) &&
                !themeList.contains(event.target)
            ) {
                closeThemeList();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeThemeList();
            }
        });
    }

    /* --- Dynamic Year --- */
    function initDynamicYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    /* --- Support & Donation Modal (BanglaQR + Buy Me a Coffee) --- */
    function initSupportModal() {
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'support-capsule-trigger';
        trigger.setAttribute('aria-label', 'Support Ocean');
        trigger.setAttribute('title', 'Support My Work');
        trigger.innerHTML = `
            <span class="support-capsule-icon" aria-hidden="true"><i class="fas fa-heart"></i></span>
            <span class="support-capsule-label">Support</span>
        `;

        const backdrop = document.createElement('div');
        backdrop.className = 'support-modal-backdrop';
        backdrop.id = 'supportModalBackdrop';

        const dialog = document.createElement('div');
        dialog.className = 'support-modal-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'supportModalTitle');
        dialog.innerHTML = `
            <div class="support-modal-content">
                <div class="support-modal-header">
                    <div class="mac-window-dots" aria-hidden="true">
                        <span class="mac-dot red"></span>
                        <span class="mac-dot yellow"></span>
                        <span class="mac-dot green"></span>
                    </div>
                    <h3 id="supportModalTitle" class="support-modal-title">Support My Work</h3>
                    <button type="button" class="support-modal-close" aria-label="Close support dialog" title="Close">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>

                <div class="support-grid-columns">
                    <!-- Column 1: BanglaQR -->
                    <div class="support-col-card">
                        <div class="support-col-header">
                            <span class="support-col-icon" aria-hidden="true"><i class="fas fa-qrcode"></i></span>
                            <div class="support-col-titles">
                                <h4 class="support-col-title">BanglaQR Scan</h4>
                                <span class="support-col-desc">Instant scan via bKash, Nagad, or Bank</span>
                            </div>
                        </div>

                        <div class="qr-scanner-card">
                            <div class="qr-frame">
                                <div class="qr-scan-line" aria-hidden="true"></div>
                                <img src="assets/images/banglaQR.jpg" alt="BanglaQR donation code for Ocean Mallik" class="qr-image">
                            </div>
                            <div class="qr-actions">
                                <a href="assets/images/banglaQR.jpg" download="OceanMallik-BanglaQR.jpg" class="btn btn-primary qr-download-btn">
                                    <i class="fas fa-download" aria-hidden="true"></i> Download QR Image
                                </a>
                            </div>
                            <div class="qr-instructions">
                                <div class="qr-step"><span class="step-num">1</span> Download QR or point camera</div>
                                <div class="qr-step"><span class="step-num">2</span> Open bKash, Nagad, Rocket, or Bank</div>
                                <div class="qr-step"><span class="step-num">3</span> Scan with camera or pick from Gallery</div>
                            </div>
                            <div class="supported-mfs-tags" aria-label="Supported payment apps">
                                <span class="mfs-tag">bKash</span>
                                <span class="mfs-tag">Nagad</span>
                                <span class="mfs-tag">Rocket</span>
                                <span class="mfs-tag">Cellfin</span>
                                <span class="mfs-tag">Upay</span>
                                <span class="mfs-tag">BanglaQR Banks</span>
                            </div>
                        </div>
                    </div>

                    <!-- Column 2: SupportKori / Card & Online Checkout -->
                    <div class="support-col-card">
                        <div class="support-col-header">
                            <span class="support-col-icon coffee-icon" aria-hidden="true"><i class="fas fa-mug-hot"></i></span>
                            <div class="support-col-titles">
                                <h4 class="support-col-title">SupportKori &amp; Cards</h4>
                                <span class="support-col-desc">Cards, mobile wallets, or custom coffee</span>
                            </div>
                        </div>

                        <div class="supportkori-frame-card">
                            <div class="supportkori-iframe-wrapper">
                                <iframe
                                    src="https://supportkori.com/widget/oceanmallik"
                                    class="supportkori-embedded-iframe"
                                    title="Donate to oceanmallik"
                                    loading="lazy"
                                ></iframe>
                            </div>
                            <div class="supportkori-footer-note">
                                <span>Powered by SupportKori</span>
                                <a href="https://supportkori.com/oceanmallik" target="_blank" rel="noopener noreferrer" class="supportkori-external-link">
                                    <span>Open in new window</span>
                                    <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const openModal = () => {
            backdrop.classList.add('show');
            dialog.classList.add('show');
            document.body.style.overflow = 'hidden';
            const closeBtn = dialog.querySelector('.support-modal-close');
            if (closeBtn) closeBtn.focus();
        };

        const closeModal = () => {
            backdrop.classList.remove('show');
            dialog.classList.remove('show');
            document.body.style.overflow = '';
            trigger.focus();
        };

        trigger.addEventListener('click', openModal);

        const closeBtn = dialog.querySelector('.support-modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && dialog.classList.contains('show')) {
                closeModal();
            }
        });

        window.addEventListener('message', (event) => {
            if (event.data === 'close-sk-widget') {
                closeModal();
            }
        });

        try {
            const pageUrl = new URL(window.location.href);
            if (pageUrl.searchParams.has('sk_payment')) {
                openModal();
            }
        } catch (e) {}

        document.body.append(trigger, backdrop, dialog);
    }

    /* --- Typing Effect in Hero --- */
    function initTypingEffect() {
        const typingElement = document.getElementById('typing-text');
        if (!typingElement) return;

        const fullText = 'Software Engineer in training, currently powered by curiosity and caffeine.';
        let charIndex = 0;
        let isDeleting = false;

        const tick = () => {
            typingElement.textContent = fullText.slice(0, charIndex);

            if (!isDeleting && charIndex < fullText.length) {
                charIndex += 1;
                setTimeout(tick, 45);
                return;
            }

            if (!isDeleting && charIndex === fullText.length) {
                isDeleting = true;
                setTimeout(tick, 5000);
                return;
            }

            if (isDeleting && charIndex > 0) {
                charIndex -= 1;
                setTimeout(tick, 25);
                return;
            }

            isDeleting = false;
            setTimeout(tick, 350);
        };

        typingElement.textContent = '';
        tick();
    }

    /* --- Hero Pointer Light on Buttons --- */
    function initHeroPointerLight() {
        const heroButtons = document.querySelectorAll('.hero-buttons .btn');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!heroButtons.length || prefersReducedMotion) return;

        heroButtons.forEach((buttonElement) => {
            const setPointerLight = (event) => {
                const rect = buttonElement.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;

                buttonElement.style.setProperty('--mx', `${Math.max(0, Math.min(100, x))}%`);
                buttonElement.style.setProperty('--my', `${Math.max(0, Math.min(100, y))}%`);
            };

            buttonElement.addEventListener('pointermove', setPointerLight);
            buttonElement.addEventListener('pointerenter', setPointerLight);
            buttonElement.addEventListener('pointerleave', () => {
                buttonElement.style.setProperty('--mx', '50%');
                buttonElement.style.setProperty('--my', '50%');
            });
        });
    }

    /* --- Helper: Fetch with fallback paths --- */
    async function fetchJsonWithFallback(paths) {
        for (const path of paths) {
            try {
                const res = await fetch(path);
                if (res.ok) {
                    return await res.json();
                }
            } catch (err) {
                // Try next path
            }
        }
        throw new Error('All candidate fetch paths failed');
    }

    /* --- Certificate Lightbox Modal --- */
    let lightboxModalEl = null;

    function initCertificateLightbox() {
        if (lightboxModalEl) return;

        lightboxModalEl = document.createElement('div');
        lightboxModalEl.id = 'certificate-lightbox';
        lightboxModalEl.className = 'certificate-lightbox';
        lightboxModalEl.setAttribute('role', 'dialog');
        lightboxModalEl.setAttribute('aria-modal', 'true');
        lightboxModalEl.innerHTML = `
            <div class="lightbox-panel">
                <div class="lightbox-header">
                    <h3 class="lightbox-title" id="lightbox-title">Certificate Inspection</h3>
                    <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Close Preview" title="Close Preview">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="lightbox-body">
                    <img id="lightbox-img" src="" alt="Certificate Preview">
                </div>
                <div class="lightbox-footer">
                    <span class="lightbox-issuer" id="lightbox-issuer"><i class="fas fa-shield-alt highlight"></i> Verified Credential</span>
                    <a id="lightbox-verify" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Verify on Official Site
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(lightboxModalEl);

        const closeBtn = lightboxModalEl.querySelector('#lightbox-close');
        const closeLightbox = () => {
            lightboxModalEl.classList.remove('show');
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        lightboxModalEl.addEventListener('click', (event) => {
            if (event.target === lightboxModalEl) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && lightboxModalEl.classList.contains('show')) {
                closeLightbox();
            }
        });
    }

    function openCertificateLightbox(certificate, imageBasePath) {
        initCertificateLightbox();

        const titleEl = document.getElementById('lightbox-title');
        const imgEl = document.getElementById('lightbox-img');
        const issuerEl = document.getElementById('lightbox-issuer');
        const verifyEl = document.getElementById('lightbox-verify');

        if (titleEl) titleEl.textContent = certificate.title || 'Certificate';
        if (imgEl) {
            imgEl.src = certificate.image ? `${imageBasePath || ''}${certificate.image}` : '';
            imgEl.alt = certificate.alt || certificate.title || 'Certificate Preview';
        }
        if (issuerEl) {
            issuerEl.innerHTML = `<i class="fas fa-shield-alt highlight"></i> Issued by: <strong>${certificate.issuer || 'Verified Organization'}</strong>`;
        }
        if (verifyEl) {
            verifyEl.href = certificate.verifyUrl || '#';
            if (!certificate.verifyUrl || certificate.verifyUrl === '#') {
                verifyEl.style.display = 'none';
            } else {
                verifyEl.style.display = 'inline-flex';
            }
        }

        lightboxModalEl.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    /* --- Reusable Supabase-Style Bento Feature Card Component --- */
    function formatDescriptionWithKeyPhrase(desc, techArr = [], fallbackTerm = '') {
        if (!desc) return '';
        if (desc.includes('<strong>')) return desc;

        const candidates = [
            'native android app', 'note-hosting website', 'indie game in development',
            'indie game', 'portfolio website', 'blood donation', 'developer tools',
            'command-line tool', 'systems programming', 'notification tracker',
            'cross platform', 'relational databases', 'responsive web design',
            'foundational c#', 'space apps challenge', 'competitive programming',
            'freecodecamp', 'hackerrank', 'microsoft',
            ...(Array.isArray(techArr) ? techArr : []),
            fallbackTerm
        ].filter(Boolean);

        for (const candidate of candidates) {
            const regex = new RegExp(`(${candidate})`, 'i');
            if (regex.test(desc)) {
                return desc.replace(regex, '<strong>$1</strong>');
            }
        }

        const words = desc.split(' ');
        if (words.length > 3) {
            return `<strong>${words.slice(0, 2).join(' ')}</strong> ${words.slice(2).join(' ')}`;
        }
        return `<strong>${desc}</strong>`;
    }

    function createBentoCard({
        iconClass = 'fas fa-layer-group',
        title = '',
        titleUrl = '',
        descriptionHtml = '',
        graphicIcon = '',
        graphicImg = '',
        photoFadeImg = '',
        photoFadeAlt = '',
        checklist = [],
        className = '',
        colSpan2 = false,
        dataset = {},
        onInspect = null
    }) {
        const card = document.createElement('article');
        card.className = `card bento-card ${colSpan2 ? 'col-span-2 ' : ''}${className}`.trim();

        Object.entries(dataset).forEach(([k, v]) => {
            card.dataset[k] = v;
        });

        // 1. Top Content Area
        const mainArea = document.createElement('div');
        mainArea.className = 'card-main';

        // Header row: small line icon (18px, color #a1a1a1) + title (16px, weight 600, color #fff), gap 12px
        const header = document.createElement('div');
        header.className = 'card-header';

        const headerIcon = document.createElement('span');
        headerIcon.className = 'card-header-icon';
        headerIcon.setAttribute('aria-hidden', 'true');
        headerIcon.innerHTML = `<i class="${iconClass}"></i>`;

        const titleEl = document.createElement('h3');
        titleEl.className = 'card-title';
        if (titleUrl && titleUrl !== '#') {
            const link = document.createElement('a');
            link.href = titleUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = title;
            titleEl.appendChild(link);
        } else {
            titleEl.textContent = title;
        }

        header.appendChild(headerIcon);
        header.appendChild(titleEl);
        mainArea.appendChild(header);

        // Description below title: 14px, color #8f8f8f, line-height 1.5.
        // Wrap key phrase in <strong> with color #fff, weight 500
        const descEl = document.createElement('p');
        descEl.className = 'card-description';
        descEl.innerHTML = descriptionHtml;
        mainArea.appendChild(descEl);

        card.appendChild(mainArea);

        // 2. Right Visual Area:
        // If photoFadeImg is provided (e.g. certificate photos), fit from right and smoothly fade away into #1c1c1c
        // Otherwise, render standard concentric squares + faded logo graphic at 10-20% opacity
        if (photoFadeImg) {
            const photoContainer = document.createElement('div');
            photoContainer.className = 'card-photo-visual';
            if (onInspect) {
                photoContainer.setAttribute('role', 'button');
                photoContainer.setAttribute('tabindex', '0');
                photoContainer.setAttribute('aria-label', `Inspect ${title || 'certificate'} high-resolution`);
                photoContainer.setAttribute('title', 'Click to inspect high-resolution');
                photoContainer.addEventListener('click', onInspect);
                photoContainer.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onInspect(e);
                    }
                });
            }

            const photoImg = document.createElement('img');
            photoImg.className = 'card-photo-img';
            photoImg.src = photoFadeImg;
            photoImg.alt = photoFadeAlt || title || 'Certificate';
            photoImg.loading = 'lazy';

            const overlay = document.createElement('div');
            overlay.className = 'card-photo-fade-overlay';
            overlay.setAttribute('aria-hidden', 'true');

            photoContainer.appendChild(photoImg);
            photoContainer.appendChild(overlay);
            card.appendChild(photoContainer);
        } else {
            const illustration = document.createElement('div');
            illustration.className = 'card-illustration';
            illustration.setAttribute('aria-hidden', 'true');

            const concentric = document.createElement('div');
            concentric.className = 'concentric-squares';
            for (let i = 1; i <= 4; i++) {
                const sq = document.createElement('span');
                sq.className = `concentric-square square-${i}`;
                concentric.appendChild(sq);
            }
            illustration.appendChild(concentric);

            const graphic = document.createElement('div');
            graphic.className = 'card-illustration-graphic';
            if (graphicImg) {
                const img = document.createElement('img');
                img.src = graphicImg;
                img.alt = '';
                img.loading = 'lazy';
                graphic.appendChild(img);
            } else {
                const gIcon = document.createElement('i');
                gIcon.className = graphicIcon || iconClass;
                graphic.appendChild(gIcon);
            }
            illustration.appendChild(graphic);

            if (onInspect) {
                illustration.style.cursor = 'pointer';
                illustration.setAttribute('role', 'button');
                illustration.setAttribute('tabindex', '0');
                illustration.setAttribute('title', 'Click to inspect');
                illustration.addEventListener('click', onInspect);
            }

            card.appendChild(illustration);
        }

        // 3. Checklist pinned to the bottom of the card:
        // 3 items, each with a small check icon (14px, #d4d4d4) + text (14px, color #d4d4d4), gap 8px between rows
        const checklistUl = document.createElement('ul');
        checklistUl.className = 'card-checklist';

        checklist.slice(0, 3).forEach((item) => {
            const li = document.createElement('li');
            li.className = 'card-checklist-item';

            const checkIcon = document.createElement('i');
            checkIcon.className = (item.icon || 'fas fa-check') + ' card-check-icon';
            checkIcon.setAttribute('aria-hidden', 'true');

            const textSpan = document.createElement('span');
            textSpan.className = 'card-check-text';
            if (item.html) {
                textSpan.innerHTML = item.html;
            } else {
                textSpan.textContent = item.text || '';
            }

            li.appendChild(checkIcon);
            li.appendChild(textSpan);
            checklistUl.appendChild(li);
        });

        card.appendChild(checklistUl);

        return card;
    }

    // Expose globally so external pages (like mygit.html) can reuse the same Card component
    window.createBentoCard = createBentoCard;
    window.formatDescriptionWithKeyPhrase = formatDescriptionWithKeyPhrase;

    /* --- Activities Rendering & Interactive Filters --- */
    function initActivitiesFromJson() {
        const activitiesGrid = document.getElementById('activities-grid');
        const activitiesPreviewGrid = document.getElementById('activities-preview-grid');

        if (!activitiesGrid && !activitiesPreviewGrid) {
            return;
        }

        const statusMap = {
            active: { className: 'status-active', label: 'In Development' },
            finished: { className: 'status-finished', label: 'Completed' },
            idle: { className: 'status-idle', label: 'Exploring / Idle' }
        };

        const createCardElement = (activity) => {
            const statusConfig = typeof activity.status === 'string' ? statusMap[activity.status] : null;
            const statusLabel = activity.statusLabel || (statusConfig ? statusConfig.label : 'Active');
            const categoryTitle = activity.category ? (activity.category.charAt(0).toUpperCase() + activity.category.slice(1)) : 'Project';

            const techString = Array.isArray(activity.tech) && activity.tech.length > 0
                ? activity.tech.slice(0, 3).join(', ')
                : 'Software Engineering';

            const linksHtml = Array.isArray(activity.links) && activity.links.length > 0
                ? activity.links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="card-inline-link">${l.label}</a>`).join(' • ')
                : `<a href="${activity.primaryUrl || '#'}" target="_blank" rel="noopener noreferrer" class="card-inline-link">Explore Project</a>`;

            const descriptionHtml = formatDescriptionWithKeyPhrase(activity.description, activity.tech, activity.category);

            const checklist = [
                { html: `Status: <strong>${statusLabel}</strong> (${categoryTitle})` },
                { html: `Stack: <strong>${techString}</strong>` },
                { html: `Links: ${linksHtml}` }
            ];

            return createBentoCard({
                iconClass: activity.icon || 'fas fa-code',
                title: activity.title || 'Untitled Activity',
                titleUrl: activity.primaryUrl || '#',
                descriptionHtml,
                graphicIcon: activity.icon || 'fas fa-code',
                checklist,
                className: 'project-card',
                colSpan2: false,
                dataset: {
                    category: activity.category || ''
                }
            });
        };

        const showInfoMessage = (targetGrid, message) => {
            if (!targetGrid) return;
            targetGrid.innerHTML = `
                <div class="card project-card" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                    <i class="fas fa-search" style="font-size: 2rem; color: #8f8f8f; margin-bottom: 12px; display: block;" aria-hidden="true"></i>
                    <h3 class="card-title" style="margin-bottom: 8px;">No matching activities found</h3>
                    <p class="card-description" style="max-width: 100%; margin: 0 auto;">${message}</p>
                </div>
            `;
        };

        const renderActivitiesIntoGrid = (targetGrid, activities, limit = null) => {
            if (!targetGrid) return;
            targetGrid.innerHTML = '';
            const itemsToRender = limit === null ? activities : activities.slice(0, limit);

            if (itemsToRender.length === 0) {
                showInfoMessage(targetGrid, 'No activities match your current search or category filter.');
                return;
            }

            itemsToRender.forEach((activity) => {
                targetGrid.appendChild(createCardElement(activity));
            });
        };

        fetchJsonWithFallback(['data/myWorks.json', './data/myWorks.json', 'myWorks.json', './myWorks.json', '../myWorks.json'])
            .then((data) => {
                const allActivities = Array.isArray(data) ? data : data.works;
                if (!Array.isArray(allActivities) || allActivities.length === 0) {
                    showInfoMessage(activitiesGrid, 'No activities found in myWorks.json yet.');
                    showInfoMessage(activitiesPreviewGrid, 'No activities found in myWorks.json yet.');
                    return;
                }

                // Render preview grid (homepage)
                if (activitiesPreviewGrid) {
                    renderActivitiesIntoGrid(activitiesPreviewGrid, allActivities, 3);
                }

                // If on activities.html, set up interactive search & filter tabs
                if (activitiesGrid) {
                    let activeFilter = 'all';
                    let searchQuery = '';

                    const countAllEl = document.getElementById('count-all');
                    if (countAllEl) countAllEl.textContent = allActivities.length;

                    const summaryCountEl = document.getElementById('activity-result-count');
                    const searchInput = document.getElementById('activity-search-input');
                    const searchClearBtn = document.getElementById('activity-search-clear');
                    const filterButtons = document.querySelectorAll('#activity-filter-group .filter-pill');

                    const applyFilters = () => {
                        const filtered = allActivities.filter((item) => {
                            // Category match
                            let matchesCategory = true;
                            if (activeFilter !== 'all') {
                                matchesCategory = item.category === activeFilter;
                            }

                            // Search match
                            let matchesSearch = true;
                            if (searchQuery.trim().length > 0) {
                                const q = searchQuery.toLowerCase();
                                const title = (item.title || '').toLowerCase();
                                const desc = (item.description || '').toLowerCase();
                                const tech = Array.isArray(item.tech) ? item.tech.join(' ').toLowerCase() : '';
                                matchesSearch = title.includes(q) || desc.includes(q) || tech.includes(q);
                            }

                            return matchesCategory && matchesSearch;
                        });

                        renderActivitiesIntoGrid(activitiesGrid, filtered);

                        if (summaryCountEl) {
                            summaryCountEl.textContent = `Showing ${filtered.length} of ${allActivities.length} activities`;
                        }
                    };

                    filterButtons.forEach((btn) => {
                        btn.addEventListener('click', () => {
                            filterButtons.forEach((b) => b.classList.remove('active'));
                            btn.classList.add('active');
                            activeFilter = btn.dataset.filter || 'all';
                            applyFilters();
                        });
                    });

                    if (searchInput) {
                        searchInput.addEventListener('input', (e) => {
                            searchQuery = e.target.value;
                            if (searchClearBtn) {
                                searchClearBtn.classList.toggle('hidden', searchQuery.length === 0);
                            }
                            applyFilters();
                        });
                    }

                    if (searchClearBtn) {
                        searchClearBtn.addEventListener('click', () => {
                            if (searchInput) {
                                searchInput.value = '';
                                searchQuery = '';
                                searchClearBtn.classList.add('hidden');
                                searchInput.focus();
                                applyFilters();
                            }
                        });
                    }

                    applyFilters();
                }
            })
            .catch(() => {
                showInfoMessage(activitiesGrid, 'Could not load activities right now. Please verify myWorks.json is accessible.');
                showInfoMessage(activitiesPreviewGrid, 'Could not load activities right now. Please verify myWorks.json is accessible.');
            });
    }

    /* --- Certificates Rendering & Lightbox Interaction --- */
    function initCertificatesFromJson() {
        const accordionContainer = document.getElementById('certificates-accordion');
        if (!accordionContainer) return;

        const imageBasePath = accordionContainer.dataset.certificatesImageBase || 'assets/images/achievements/';
        const sourceFile = accordionContainer.dataset.certificatesSource || 'data/myCertificates.json';
        const limitValue = parseInt(accordionContainer.dataset.certificatesLimit, 10);
        const certificatesLimit = Number.isNaN(limitValue) ? null : Math.max(0, limitValue);
        const featuredOnly = accordionContainer.dataset.certificatesFeaturedOnly === 'true';

        initCertificateLightbox();

        const renderInfoCard = (message) => {
            accordionContainer.innerHTML = `
                <div class="card bento-card" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                    <i class="fas fa-certificate" style="font-size: 2rem; color: #8f8f8f; margin-bottom: 12px; display: block;" aria-hidden="true"></i>
                    <h3 class="card-title" style="margin-bottom: 8px;">Certificates</h3>
                    <p class="card-description" style="max-width: 100%; margin: 0 auto;">${message}</p>
                </div>
            `;
        };

        const categoryMap = {
            programming: { label: 'Programming', icon: 'fas fa-code' },
            database: { label: 'Database', icon: 'fas fa-database' },
            web: { label: 'Web Design', icon: 'fas fa-laptop-code' },
            contest: { label: 'Contest', icon: 'fas fa-trophy' },
            productivity: { label: 'Productivity', icon: 'fas fa-file-alt' }
        };

        const renderCertificates = (certificates) => {
            accordionContainer.innerHTML = '';

            if (!certificates || certificates.length === 0) {
                renderInfoCard('No certificates match your current filter.');
                return;
            }

            certificates.forEach((certificate) => {
                const cat = categoryMap[certificate.category] || {
                    label: certificate.category ? (certificate.category.charAt(0).toUpperCase() + certificate.category.slice(1)) : 'General',
                    icon: 'fas fa-certificate'
                };

                const triggerLightbox = (event) => {
                    if (event) event.preventDefault();
                    openCertificateLightbox(certificate, imageBasePath);
                };

                const descriptionHtml = `Verified credential issued by <strong>${certificate.issuer || 'Official Organization'}</strong> in ${cat.label}.`;

                const inspectLinkHtml = `<button type="button" class="cert-inspect-btn">Inspect High-Res</button>`;
                const verifyLinkHtml = (certificate.verifyUrl && certificate.verifyUrl !== '#')
                    ? ` • <a href="${certificate.verifyUrl}" target="_blank" rel="noopener noreferrer" class="card-inline-link">Verify Online</a>`
                    : '';

                const checklist = [
                    { html: `Issuer: <strong>${certificate.issuer || 'Verified Organization'}</strong>` },
                    { html: `Category: <strong>${cat.label}</strong>` },
                    { html: `Credential: ${inspectLinkHtml}${verifyLinkHtml}` }
                ];

                const card = createBentoCard({
                    iconClass: cat.icon || 'fas fa-certificate',
                    title: certificate.title || 'Untitled Certificate',
                    titleUrl: certificate.verifyUrl || '',
                    descriptionHtml,
                    photoFadeImg: certificate.image ? `${imageBasePath}${certificate.image}` : '',
                    photoFadeAlt: certificate.title || '',
                    graphicIcon: cat.icon || 'fas fa-certificate',
                    checklist,
                    className: 'certificate-item',
                    colSpan2: false,
                    onInspect: triggerLightbox
                });

                const inspectBtn = card.querySelector('.cert-inspect-btn');
                if (inspectBtn) {
                    inspectBtn.addEventListener('click', triggerLightbox);
                }

                accordionContainer.appendChild(card);
            });
        };

        fetchJsonWithFallback([sourceFile, 'data/myCertificates.json', './data/myCertificates.json', 'myCertificates.json', './myCertificates.json', '../../myCertificates.json'])
            .then((data) => {
                const allCertificates = Array.isArray(data) ? data : data.certificates;
                if (!Array.isArray(allCertificates) || allCertificates.length === 0) {
                    renderInfoCard('No certificates found in myCertificates.json yet.');
                    return;
                }

                // If on homepage with a limit, render the first N
                if (certificatesLimit !== null) {
                    const featured = featuredOnly ? allCertificates.filter((c) => c && c.featured) : allCertificates;
                    renderCertificates(featured.slice(0, certificatesLimit));
                    return;
                }

                // If on certificates.html, build filter pills dynamically from JSON categories
                const filterGroup = document.getElementById('cert-filter-group');
                if (filterGroup) {
                    // "All" pill first
                    const allBtn = document.createElement('button');
                    allBtn.type = 'button';
                    allBtn.className = 'filter-pill active';
                    allBtn.dataset.filter = 'all';
                    allBtn.textContent = 'All Certificates';
                    filterGroup.appendChild(allBtn);

                    // Collect unique categories in the order they first appear
                    const seenCategories = [];
                    allCertificates.forEach((cert) => {
                        if (cert.category && !seenCategories.includes(cert.category)) {
                            seenCategories.push(cert.category);
                        }
                    });

                    // Build a pill for each unique category
                    seenCategories.forEach((catKey) => {
                        const cat = categoryMap[catKey] || { label: catKey.charAt(0).toUpperCase() + catKey.slice(1) };
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'filter-pill';
                        btn.dataset.filter = catKey;
                        btn.textContent = cat.label;
                        filterGroup.appendChild(btn);
                    });

                    let activeCategory = 'all';

                    // Query all pills AFTER they are all appended
                    const allFilterButtons = filterGroup.querySelectorAll('.filter-pill');

                    const applyCertFilter = () => {
                        const filtered = allCertificates.filter((cert) => {
                            if (activeCategory === 'all') return true;
                            return cert.category === activeCategory;
                        });
                        renderCertificates(filtered);
                    };

                    allFilterButtons.forEach((btn) => {
                        btn.addEventListener('click', () => {
                            allFilterButtons.forEach((b) => b.classList.remove('active'));
                            btn.classList.add('active');
                            activeCategory = btn.dataset.filter || 'all';
                            applyCertFilter();
                        });
                    });

                    applyCertFilter();
                } else {
                    renderCertificates(allCertificates);
                }
            })
            .catch(() => {
                renderInfoCard('Could not load certificates right now. Please verify myCertificates.json.');
            });
    }

    /* --- Technical Skills Rendering from JSON --- */
    function initSkillsFromJson() {
        const container = document.getElementById('skills-container');
        if (!container) return;

        const sourcePath = container.dataset.skillsSource || 'data/mySkills.json';

        fetchJsonWithFallback([sourcePath, 'data/mySkills.json', './data/mySkills.json', './mySkills.json', 'mySkills.json'])
            .then((categories) => {
                if (!Array.isArray(categories) || categories.length === 0) return;

                container.innerHTML = '';
                categories.forEach((cat) => {
                    const catEl = document.createElement('div');
                    catEl.className = 'skill-category';

                    const h4 = document.createElement('h4');
                    h4.innerHTML = `<i class="${cat.icon || 'fas fa-code'}"></i> ${cat.category || 'Skills'}`;
                    catEl.appendChild(h4);

                    const badgesEl = document.createElement('div');
                    badgesEl.className = 'skill-badges';

                    (Array.isArray(cat.skills) ? cat.skills : []).forEach((skill) => {
                        const badge = document.createElement('span');
                        badge.className = 'skill-badge';
                        badge.innerHTML = `<i class="${skill.icon || 'fas fa-code'}"></i> ${skill.name || ''}`;
                        badgesEl.appendChild(badge);
                    });

                    catEl.appendChild(badgesEl);
                    container.appendChild(catEl);
                });
            })
            .catch(() => {
                // Kept silent if error or fallback exists
            });
    }

    /* --- Educational Qualification Rendering from JSON --- */
    function initEducationFromJson() {
        const container = document.getElementById('education-timeline');
        if (!container) return;

        const sourcePath = container.dataset.educationSource || 'data/myEducation.json';

        fetchJsonWithFallback([sourcePath, 'data/myEducation.json', './data/myEducation.json', './myEducation.json', 'myEducation.json'])
            .then((items) => {
                if (!Array.isArray(items) || items.length === 0) return;

                container.innerHTML = '';
                items.forEach((item) => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'timeline-item';

                    const dot = document.createElement('div');
                    dot.className = 'timeline-dot';
                    itemEl.appendChild(dot);

                    const content = document.createElement('div');
                    content.className = 'timeline-content';

                    if (item.date) {
                        const dateSpan = document.createElement('span');
                        dateSpan.className = 'timeline-date';
                        dateSpan.textContent = item.date;
                        content.appendChild(dateSpan);
                    }

                    const h3 = document.createElement('h3');
                    h3.textContent = item.institution || '';
                    content.appendChild(h3);

                    const p = document.createElement('p');
                    p.innerHTML = `${item.degree || ''} ${item.result ? `<span class="highlight">(${item.result})</span>` : ''}`.trim();
                    content.appendChild(p);

                    itemEl.appendChild(content);
                    container.appendChild(itemEl);
                });
            })
            .catch(() => {
                // Kept silent if error or fallback exists
            });
    }

    /* --- Scroll Reveal Animations --- */
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');

        if (window.IntersectionObserver) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -40px 0px'
            });

            reveals.forEach((reveal) => {
                revealObserver.observe(reveal);
            });
        } else {
            reveals.forEach((reveal) => reveal.classList.add('active'));
        }
    }

    /* --- Main App Initialization --- */
    function initSite() {
        initScrollProgress();
        initBackToTop();
        initDynamicYear();
        initSupportModal();
        initMobileMenu();
        initThemeSwitcher();
        initTypingEffect();
        initHeroPointerLight();
        initActivitiesFromJson();
        initCertificatesFromJson();
        initSkillsFromJson();
        initEducationFromJson();
        initScrollReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSite);
    } else {
        initSite();
    }
})();
