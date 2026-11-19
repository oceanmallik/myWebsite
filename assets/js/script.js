(function () {
    const THEME_CLASSES = ['theme-black', 'theme-white', 'theme-soft', 'theme-aurora', 'theme-cyberpunk'];
    const THEME_ICONS = ['fa-moon', 'fa-sun', 'fa-cloud', 'fa-water', 'fa-bolt'];
    const THEME_LABELS = ['Black', 'White', 'Soft', 'Aurora', 'Cyberpunk'];

    function getStoredThemeIndex() {
        const storedThemeName = localStorage.getItem('selectedTheme');
        if (storedThemeName) {
            const idx = THEME_CLASSES.indexOf(storedThemeName);
            if (idx !== -1) return idx;
        }

        const storedIndex = parseInt(localStorage.getItem('themeIndex_v2'), 10);
        if (!Number.isNaN(storedIndex) && storedIndex >= 0 && storedIndex < THEME_CLASSES.length) {
            return storedIndex;
        }

        // Default to Pitch Black (index 0)
        return 0;
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
                    localStorage.setItem('themeIndex_v2', String(normalizedIndex));
                    localStorage.setItem('themeIndex', String(normalizedIndex));
                    localStorage.setItem('selectedTheme', THEME_CLASSES[normalizedIndex]);
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
            try {
                const escaped = String(candidate).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escaped})`, 'i');
                if (regex.test(desc)) {
                    return desc.replace(regex, '<strong>$1</strong>');
                }
            } catch (_) {}
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
        onInspect = null,
        headerRightEl = null,
        headerRightHtml = ''
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

        if (headerRightEl) {
            header.appendChild(headerRightEl);
        } else if (headerRightHtml) {
            const rightContainer = document.createElement('div');
            rightContainer.className = 'card-header-right';
            rightContainer.innerHTML = headerRightHtml;
            header.appendChild(rightContainer);
        }

        mainArea.appendChild(header);

        // Description below title: 14px, color #8f8f8f, line-height 1.5.
        // Wrap key phrase in <strong> with color #fff, weight 500 (only appended if non-empty)
        if (descriptionHtml && descriptionHtml.trim().length > 0) {
            const descEl = document.createElement('p');
            descEl.className = 'card-description';
            descEl.innerHTML = descriptionHtml;
            mainArea.appendChild(descEl);
        }

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

    /* --- Activities Rendering & Interactive Showcase --- */
    function initActivitiesFromJson() {
        const showcaseList = document.getElementById('showcase-list');
        const activitiesGrid = document.getElementById('activities-grid');
        const activitiesPreviewGrid = document.getElementById('activities-preview-grid');

        if (!showcaseList && !activitiesGrid && !activitiesPreviewGrid) {
            return;
        }

        const categoryNormalize = (cat) => {
            if (!cat) return 'web';
            const c = String(cat).toLowerCase().trim();
            if (c === 'tools') return 'tool';
            if (c === 'systems') return 'system';
            if (c === 'games') return 'game';
            if (c === 'mobile' || c === 'app' || c === 'apps') return 'mobile';
            return c;
        };

        const categoryLabels = {
            mobile: 'Mobile',
            web: 'Web & Apps',
            game: 'Game',
            tool: 'Tool & CLI',
            system: 'System'
        };

        const statusNormalize = (status) => {
            if (!status) return { label: 'In Development', slug: 'in-development' };
            const s = String(status).toLowerCase().trim();
            if (s === 'active' || s === 'in development' || s.includes('develop')) {
                return { label: 'In Development', slug: 'in-development' };
            }
            if (s === 'finished' || s === 'completed' || s.includes('complete')) {
                return { label: 'Completed', slug: 'completed' };
            }
            if (s === 'idle' || s.includes('explor')) {
                return { label: 'Exploring / Idle', slug: 'idle' };
            }
            return { label: status, slug: s.replace(/\s+/g, '-') };
        };

        const getDomainFromUrl = (url, fallbackTitle) => {
            try {
                if (!url || url === '#' || url.startsWith('/')) {
                    return fallbackTitle ? `${fallbackTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}.dev` : 'oceanmallik.com';
                }
                const parsed = new URL(url);
                return parsed.hostname.replace(/^www\./, '');
            } catch (e) {
                return fallbackTitle ? `${fallbackTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}.dev` : 'oceanmallik.com';
            }
        };

        const getFallbackSvgDataUri = (title, category) => {
            const safeTitle = (title || 'Project').replace(/[<>&"]/g, '');
            const safeCat = (category || 'Code').toUpperCase();
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="#141418"/><circle cx="400" cy="250" r="160" fill="#202028" opacity="0.6"/><text x="400" y="230" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">${safeTitle}</text><text x="400" y="275" fill="#888899" font-family="sans-serif" font-size="16" letter-spacing="4" text-anchor="middle">${safeCat}</text></svg>`;
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        };

        // Render preview grid on homepage (index.html)
        const renderPreviewGrid = (grid, activities) => {
            if (!grid) return;
            grid.innerHTML = '';
            const previewItems = activities.slice(0, 3);
            previewItems.forEach((activity) => {
                const statusInfo = statusNormalize(activity.status);
                const techList = Array.isArray(activity.stack) ? activity.stack : (Array.isArray(activity.tech) ? activity.tech : []);
                const techString = techList.slice(0, 3).join(', ') || 'Software Engineering';

                const linksHtml = Array.isArray(activity.links) && activity.links.length > 0
                    ? activity.links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="card-inline-link">${l.label}</a>`).join(' • ')
                    : `<a href="${activity.primaryUrl || '#'}" target="_blank" rel="noopener noreferrer" class="card-inline-link">Explore Project</a>`;

                const descriptionHtml = formatDescriptionWithKeyPhrase(activity.description || '', techList, activity.category);
                const categoryTitle = categoryLabels[categoryNormalize(activity.category)] || 'Project';

                const checklist = [
                    { html: `Status: <strong>${statusInfo.label}</strong> (${categoryTitle})` },
                    { html: `Stack: <strong>${techString}</strong>` },
                    { html: `Links: ${linksHtml}` }
                ];

                const card = createBentoCard({
                    iconClass: activity.icon || (activity.category === 'mobile' ? 'fas fa-mobile-alt' : (activity.category === 'game' ? 'fas fa-gamepad' : 'fas fa-code')),
                    title: activity.title || 'Untitled Project',
                    titleUrl: (activity.links && activity.links[0] ? activity.links[0].url : activity.primaryUrl) || '#',
                    descriptionHtml,
                    graphicIcon: activity.icon || 'fas fa-code',
                    checklist,
                    className: 'project-card',
                    colSpan2: false,
                    dataset: {
                        category: activity.category || ''
                    }
                });
                grid.appendChild(card);
            });
        };

        // Render scrolling showcase list on activities.html
        const renderShowcase = (container, activities) => {
            if (!container) return;
            container.innerHTML = '';

            if (activities.length === 0) {
                container.innerHTML = `
                    <div class="showcase-empty">
                        <i class="fas fa-layer-group" aria-hidden="true"></i>
                        <h3>No projects found</h3>
                        <p>No projects match the selected category filter.</p>
                    </div>
                `;
                return;
            }

            const totalCount = activities.length;
            const padNumber = (num) => String(num).padStart(2, '0');

            activities.forEach((project, index) => {
                const category = categoryNormalize(project.category);
                const isMobile = category === 'mobile';
                const statusInfo = statusNormalize(project.status);
                const stack = Array.isArray(project.stack) ? project.stack : (Array.isArray(project.tech) ? project.tech : []);
                const links = Array.isArray(project.links) ? project.links : [];
                const screenshots = Array.isArray(project.screenshots) ? project.screenshots : [];

                const counterStr = `${padNumber(index + 1)} / ${padNumber(totalCount)}`;
                // Alternating rows: project 1 (index 0) text left / image right; project 2 (index 1) image left / text right
                const isReversed = index % 2 === 1;

                const itemEl = document.createElement('article');
                itemEl.className = `showcase-item ${isReversed ? 'is-reversed' : ''}`;
                itemEl.dataset.id = project.id || `project-${index}`;
                itemEl.dataset.category = category;

                // Primary link for browser address bar & title link
                const primaryLink = links.find((l) => l.type === 'live' || !l.label.toLowerCase().includes('github')) || links[0] || null;
                const primaryUrl = primaryLink ? primaryLink.url : '#';
                const displayHost = getDomainFromUrl(primaryUrl, project.title);

                // Build Stack HTML
                const stackHtml = stack.map((tech) => `<span class="stack-badge">${tech}</span>`).join('');

                // Build Links HTML
                const linksHtml = links.map((link, lIdx) => {
                    const lLower = (link.label || '').toLowerCase();
                    const uLower = (link.url || '').toLowerCase();
                    let iconClass = 'fas fa-arrow-up-right-from-square';

                    if (lLower.includes('github') || uLower.includes('github.com')) {
                        iconClass = 'fab fa-github';
                    } else if (lLower.includes('play') || lLower.includes('store') || uLower.includes('google.com')) {
                        iconClass = 'fab fa-google-play';
                    } else if (lLower.includes('game') || category === 'game') {
                        iconClass = 'fas fa-gamepad';
                    } else if (lLower.includes('live') || lLower.includes('web') || lLower.includes('site')) {
                        iconClass = 'fas fa-arrow-up-right-from-square';
                    }

                    const btnClass = lIdx === 0 ? 'showcase-btn showcase-btn-primary' : 'showcase-btn showcase-btn-secondary';
                    return `
                        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="${btnClass}">
                            <i class="${iconClass}" aria-hidden="true"></i>
                            <span>${link.label}</span>
                        </a>
                    `;
                }).join('');

                // Build Media HTML
                let mediaHtml = '';
                const fallbackUri = getFallbackSvgDataUri(project.title, category);

                if (isMobile) {
                    const screen1 = screenshots[0] || 'assets/images/works/diu-app-1.png';
                    const screen2 = screenshots[1] || screenshots[0] || 'assets/images/works/diu-app-2.png';

                    mediaHtml = `
                        <div class="showcase-media showcase-media-mobile">
                            <div class="phones-wrapper">
                                <div class="phone-frame phone-frame-left">
                                    <div class="phone-screen">
                                        <img src="${screen1}" alt="${project.title} - screenshot 1" loading="lazy" class="phone-img" onerror="this.onerror=null;this.src='${fallbackUri}';">
                                    </div>
                                </div>
                                <div class="phone-frame phone-frame-right">
                                    <div class="phone-screen">
                                        <img src="${screen2}" alt="${project.title} - screenshot 2" loading="lazy" class="phone-img" onerror="this.onerror=null;this.src='${fallbackUri}';">
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    const screen = screenshots[0] || fallbackUri;

                    mediaHtml = `
                        <div class="showcase-media showcase-media-browser">
                            <div class="browser-frame">
                                <div class="browser-header">
                                    <div class="browser-dots" aria-hidden="true">
                                        <span class="browser-dot dot-close"></span>
                                        <span class="browser-dot dot-minimize"></span>
                                        <span class="browser-dot dot-maximize"></span>
                                    </div>
                                    <div class="browser-address-bar">
                                        <i class="fas fa-lock" aria-hidden="true"></i>
                                        <span class="browser-url">${displayHost}</span>
                                    </div>
                                    <div class="browser-header-actions" aria-hidden="true">
                                        <i class="fas fa-chevron-left"></i>
                                        <i class="fas fa-chevron-right"></i>
                                    </div>
                                </div>
                                <div class="browser-viewport">
                                    <img src="${screen}" alt="${project.title} - browser preview" loading="lazy" class="browser-img" onerror="this.onerror=null;this.src='${fallbackUri}';">
                                </div>
                            </div>
                        </div>
                    `;
                }

                itemEl.innerHTML = `
                    <div class="showcase-content">
                        <div class="showcase-meta">
                            <span class="showcase-counter">${counterStr}</span>
                            <span class="showcase-status status-${statusInfo.slug}">
                                <span class="status-dot"></span>
                                <span>${statusInfo.label}</span>
                            </span>
                            <span class="showcase-category-badge">${categoryLabels[category] || category}</span>
                        </div>
                        <h2 class="showcase-title">
                            ${primaryUrl !== '#' ? `<a href="${primaryUrl}" target="_blank" rel="noopener noreferrer">${project.title}</a>` : project.title}
                        </h2>
                        <p class="showcase-description">${project.description || ''}</p>
                        ${stack.length > 0 ? `<div class="showcase-stack">${stackHtml}</div>` : ''}
                        ${links.length > 0 ? `<div class="showcase-links">${linksHtml}</div>` : ''}
                    </div>
                    ${mediaHtml}
                `;

                container.appendChild(itemEl);
            });

            // Set up scroll reveal for showcase items
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });

                container.querySelectorAll('.showcase-item').forEach((item) => {
                    observer.observe(item);
                });
            } else {
                container.querySelectorAll('.showcase-item').forEach((item) => {
                    item.classList.add('is-visible');
                });
            }
        };

        fetchJsonWithFallback(['data/myWorks.json', './data/myWorks.json', 'myWorks.json', './myWorks.json', '../myWorks.json'])
            .then((data) => {
                const allActivities = Array.isArray(data) ? data : (data.works || []);
                if (allActivities.length === 0) {
                    if (showcaseList) showcaseList.innerHTML = '<div class="showcase-empty"><h3>No activities found</h3></div>';
                    if (activitiesPreviewGrid) activitiesPreviewGrid.innerHTML = '<div class="card project-card"><p>No activities found</p></div>';
                    return;
                }

                // Render preview grid (homepage)
                if (activitiesPreviewGrid) {
                    renderPreviewGrid(activitiesPreviewGrid, allActivities);
                }

                // Render showcase list (activities.html)
                if (showcaseList) {
                    renderShowcase(showcaseList, allActivities);
                } else if (activitiesGrid) {
                    // Fallback for legacy activitiesGrid if ever loaded
                    renderPreviewGrid(activitiesGrid, allActivities);
                }
            })
            .catch((err) => {
                console.error('Error loading myWorks.json:', err);
                if (showcaseList) {
                    showcaseList.innerHTML = '<div class="showcase-empty"><h3>Could not load activities</h3><p>Please verify myWorks.json is accessible.</p></div>';
                }
                if (activitiesPreviewGrid) {
                    activitiesPreviewGrid.innerHTML = '<div class="card project-card"><p>Could not load activities</p></div>';
                }
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

                const checklist = [
                    { html: `Issuer: <strong>${certificate.issuer || 'Verified Organization'}</strong>` },
                    { html: `Category: <strong>${cat.label}</strong>` }
                ];

                const certIcon = (certificate.icon && typeof certificate.icon === 'string' && certificate.icon.trim())
                    ? certificate.icon.trim()
                    : (cat.icon || 'fas fa-certificate');

                const card = createBentoCard({
                    iconClass: certIcon,
                    title: certificate.title || 'Untitled Certificate',
                    titleUrl: certificate.verifyUrl || '',
                    descriptionHtml: '', // Removed "Verified credential issued by..." description as requested
                    photoFadeImg: certificate.image ? `${imageBasePath}${certificate.image}` : '',
                    photoFadeAlt: certificate.title || '',
                    graphicIcon: certIcon,
                    checklist,
                    className: 'certificate-item',
                    colSpan2: false,
                    onInspect: triggerLightbox
                });

                // New design for action buttons: Inspect & Verify Online
                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'cert-card-actions';

                const inspectBtn = document.createElement('button');
                inspectBtn.type = 'button';
                inspectBtn.className = 'cert-btn cert-btn-inspect';
                inspectBtn.innerHTML = '<i class="fas fa-search-plus" aria-hidden="true"></i> <span>Inspect</span>';
                inspectBtn.setAttribute('title', 'Inspect full-size certificate');
                inspectBtn.addEventListener('click', triggerLightbox);
                actionsContainer.appendChild(inspectBtn);

                if (certificate.verifyUrl && certificate.verifyUrl !== '#') {
                    const verifyLink = document.createElement('a');
                    verifyLink.href = certificate.verifyUrl;
                    verifyLink.target = '_blank';
                    verifyLink.rel = 'noopener noreferrer';
                    verifyLink.className = 'cert-btn cert-btn-verify';
                    verifyLink.innerHTML = '<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> <span>Verify Online</span>';
                    verifyLink.setAttribute('title', 'Verify certificate online');
                    actionsContainer.appendChild(verifyLink);
                }

                card.appendChild(actionsContainer);

                // Featured Icon on the right down side of the card
                if (certificate.featured) {
                    const featuredBadge = document.createElement('div');
                    featuredBadge.className = 'cert-featured-badge';
                    featuredBadge.setAttribute('title', 'Featured Certificate');
                    featuredBadge.setAttribute('aria-label', 'Featured Certificate');
                    featuredBadge.innerHTML = '<i class="fas fa-star" aria-hidden="true"></i> <span>Featured</span>';
                    card.appendChild(featuredBadge);
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

                // Render all certificates
                renderCertificates(allCertificates);
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

    /* --- Number Counter Animation Helper --- */
    function animateCounter(element, target, duration = 1200, suffix = '') {
        if (!element) return;
        const targetNum = parseInt(target, 10);
        if (isNaN(targetNum)) {
            element.textContent = target;
            return;
        }

        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smooth easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(easeProgress * (targetNum - start) + start);
            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = targetNum + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    /* --- Profile Details & Stats Rendering from JSON --- */
    function initProfileFromJson() {
        const profileContainer = document.getElementById('profile-hero-card');
        if (!profileContainer) return;

        const sourcePath = profileContainer.dataset.profileSource || 'data/myProfile.json';

        // Fetch profile JSON with fallbacks and cross-check works/certificates
        Promise.all([
            fetchJsonWithFallback([sourcePath, 'data/myProfile.json', './data/myProfile.json', './myProfile.json']),
            fetchJsonWithFallback(['data/myWorks.json', './data/myWorks.json', 'myWorks.json']).catch(() => null),
            fetchJsonWithFallback(['data/myCertificates.json', './data/myCertificates.json', 'myCertificates.json']).catch(() => null)
        ]).then(([profile, worksData, certsData]) => {
            if (!profile) return;

            // Name
            const nameEl = document.getElementById('profile-name');
            if (nameEl && profile.name) nameEl.textContent = profile.name;

            // Handle
            const handleEl = document.getElementById('profile-handle');
            if (handleEl && profile.handle) handleEl.textContent = `@${profile.handle.replace(/^@/, '')}`;

            // Title / Tagline
            const taglineEl = document.getElementById('profile-tagline');
            if (taglineEl && (profile.tagline || profile.title)) {
                taglineEl.textContent = profile.tagline || profile.title;
            }

            // Location
            const locEl = document.getElementById('profile-location');
            if (locEl && profile.location) {
                locEl.innerHTML = `<i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${profile.location}`;
            }

            // Core focus
            const focusEl = document.getElementById('profile-focus');
            if (focusEl && profile.focus) {
                focusEl.innerHTML = `<i class="fas fa-microchip" aria-hidden="true"></i> ${profile.focus}`;
            }

            // Status
            const statusEl = document.getElementById('profile-status');
            if (statusEl && profile.status) {
                statusEl.innerHTML = `<span class="status-pulse-dot" aria-hidden="true"></span> ${profile.status}`;
            }

            // Bio
            const bioEl = document.getElementById('profile-bio');
            if (bioEl && profile.bio) {
                bioEl.innerHTML = profile.bio;
            }

            // Avatar
            const avatarEl = document.getElementById('profile-avatar');
            if (avatarEl && profile.avatar) {
                avatarEl.src = profile.avatar;
                if (profile.name) avatarEl.alt = profile.name;
            }

            // Stats calculation with fallback:
            const worksArray = Array.isArray(worksData) ? worksData : (worksData && worksData.works ? worksData.works : []);
            let projectCount = worksArray.length > 0
                ? worksArray.length
                : (profile.stats && typeof profile.stats.projects === 'number' ? profile.stats.projects : 6);

            // Apps counter: specifically mobile ones from myWorks.json
            let appsCount = worksArray.length > 0
                ? worksArray.filter((w) => (w.category || '').toLowerCase() === 'mobile').length
                : (profile.stats && typeof profile.stats.apps === 'number' ? profile.stats.apps : 1);

            const certsArray = Array.isArray(certsData) ? certsData : [];
            let certsCount = certsArray.length > 0
                ? certsArray.length
                : (profile.stats && typeof profile.stats.certificates === 'number' ? profile.stats.certificates : 11);

            // Animate local counts
            const statProjectsEl = document.getElementById('stat-projects');
            if (statProjectsEl) animateCounter(statProjectsEl, projectCount);

            const statAppsEl = document.getElementById('stat-apps');
            if (statAppsEl) animateCounter(statAppsEl, appsCount);

            const statCertsEl = document.getElementById('stat-certs');
            if (statCertsEl) animateCounter(statCertsEl, certsCount);

            // Git repo count: dynamically fetched from mygit data source
            const statReposEl = document.getElementById('stat-repos');
            const MYGIT_CACHE_URL = 'https://raw.githubusercontent.com/oceanmallik/github-data-cache/refs/heads/seed/data.json';

            fetch(MYGIT_CACHE_URL)
                .then((res) => {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then((gitData) => {
                    const user = gitData && gitData.profile;
                    let repoCount = user && typeof user.public_repos === 'number'
                        ? user.public_repos
                        : (gitData && Array.isArray(gitData.repos) ? gitData.repos.length : null);

                    if (typeof repoCount === 'number' && statReposEl) {
                        animateCounter(statReposEl, repoCount);
                    } else if (profile.stats && profile.stats.repos && statReposEl) {
                        animateCounter(statReposEl, profile.stats.repos);
                    }
                })
                .catch(() => {
                    // Fallback to GitHub public API
                    fetch('https://api.github.com/users/oceanmallik')
                        .then((res) => res.ok ? res.json() : null)
                        .then((ghUser) => {
                            if (ghUser && typeof ghUser.public_repos === 'number' && statReposEl) {
                                animateCounter(statReposEl, ghUser.public_repos);
                            } else if (profile.stats && profile.stats.repos && statReposEl) {
                                animateCounter(statReposEl, profile.stats.repos);
                            }
                        })
                        .catch(() => {
                            if (profile.stats && profile.stats.repos && statReposEl) {
                                animateCounter(statReposEl, profile.stats.repos);
                            }
                        });
                });
        }).catch((err) => {
            console.error('Error loading profile from JSON:', err);
        });
    }

    /* --- Links Hub Rendering from JSON --- */
    function initLinksFromJson() {
        const container = document.getElementById('profile-links-container');
        if (!container) return;

        const sourcePath = container.dataset.linksSource || 'data/myLinks.json';

        fetchJsonWithFallback([sourcePath, 'data/myLinks.json', './data/myLinks.json', 'myLinks.json'])
            .then((links) => {
                if (!Array.isArray(links) || links.length === 0) return;

                container.innerHTML = '';
                links.forEach((link) => {
                    const card = document.createElement('a');
                    card.href = link.url || '#';
                    card.className = 'profile-link-card';
                    card.target = '_blank';
                    card.rel = 'noopener noreferrer';
                    card.setAttribute('aria-label', `${link.title || 'Link'}: ${link.description || ''}`);

                    // Icon
                    const iconBox = document.createElement('div');
                    iconBox.className = 'profile-link-icon';
                    iconBox.innerHTML = `<i class="${link.icon || 'fas fa-link'}" aria-hidden="true"></i>`;
                    card.appendChild(iconBox);

                    // Content
                    const content = document.createElement('div');
                    content.className = 'profile-link-content';

                    const titleRow = document.createElement('div');
                    titleRow.className = 'profile-link-title-row';

                    const title = document.createElement('span');
                    title.className = 'profile-link-title';
                    title.textContent = link.title || 'Link';
                    titleRow.appendChild(title);

                    if (link.badge) {
                        const badge = document.createElement('span');
                        badge.className = 'profile-link-badge';
                        badge.textContent = link.badge;
                        titleRow.appendChild(badge);
                    }
                    content.appendChild(titleRow);

                    if (link.description) {
                        const desc = document.createElement('div');
                        desc.className = 'profile-link-desc';
                        desc.textContent = link.description;
                        content.appendChild(desc);
                    }

                    card.appendChild(content);

                    // Arrow
                    const arrow = document.createElement('div');
                    arrow.className = 'profile-link-arrow';
                    arrow.innerHTML = '<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>';
                    card.appendChild(arrow);

                    container.appendChild(card);
                });
            })
            .catch((err) => {
                console.error('Error loading links from JSON:', err);
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
        initProfileFromJson();
        initLinksFromJson();
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
