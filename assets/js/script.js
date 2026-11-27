(function () {
    const THEME_CLASSES = ['theme-black', 'theme-white', 'theme-soft', 'theme-cyberpunk'];
    const THEME_ICONS = ['fa-moon', 'fa-sun', 'fa-cloud', 'fa-bolt'];
    const THEME_LABELS = ['Black', 'White', 'Soft', 'Cyberpunk'];

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
        if (window.NAVBAR_INITIALIZED) return;
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
        if (window.NAVBAR_INITIALIZED) return;
        const themeButton = document.getElementById('theme-toggle');
        const body = document.body;

        if (!themeButton || themeButton.classList.contains('nav-theme-toggle')) {
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

    /* --- Demo Video Modal Lightbox --- */
    let videoModalEl = null;

    function parseVideoUrl(url) {
        if (!url || typeof url !== 'string') return null;
        const trimmed = url.trim();
        if (!trimmed || trimmed === '#') return null;

        // YouTube: standard watch, embed, youtu.be, shorts
        const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
        if (ytMatch) {
            return {
                type: 'youtube',
                embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
                rawUrl: trimmed
            };
        }

        // Vimeo
        const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|))(\d+)/i);
        if (vimeoMatch) {
            return {
                type: 'vimeo',
                embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
                rawUrl: trimmed
            };
        }

        // Direct video files
        if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
            return {
                type: 'direct',
                embedUrl: trimmed,
                rawUrl: trimmed
            };
        }

        // Generic URL
        return {
            type: 'generic',
            embedUrl: trimmed,
            rawUrl: trimmed
        };
    }

    function initVideoModal() {
        if (videoModalEl) return;

        videoModalEl = document.createElement('div');
        videoModalEl.id = 'video-modal';
        videoModalEl.className = 'video-modal';
        videoModalEl.setAttribute('role', 'dialog');
        videoModalEl.setAttribute('aria-modal', 'true');
        videoModalEl.setAttribute('aria-labelledby', 'video-modal-heading');
        videoModalEl.innerHTML = `
            <div class="video-modal-panel">
                <div class="video-modal-header">
                    <h3 class="video-modal-title" id="video-modal-heading">
                        <i class="fas fa-circle-play" aria-hidden="true"></i>
                        <span id="video-modal-title-text">Demo Video</span>
                    </h3>
                    <button type="button" class="video-modal-close" id="video-modal-close" aria-label="Close Video" title="Close Video">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="video-modal-body" id="video-modal-body"></div>
                <div class="video-modal-footer">
                    <span class="video-modal-subtitle" id="video-modal-subtitle">Project Demonstration</span>
                    <div class="video-modal-actions">
                        <a id="video-modal-external" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: none;">
                            <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> Open External Video
                        </a>
                        <button type="button" class="btn btn-secondary" id="video-modal-close-btn">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(videoModalEl);

        const closeBtn = videoModalEl.querySelector('#video-modal-close');
        const closeActionBtn = videoModalEl.querySelector('#video-modal-close-btn');

        const closeVideoModal = () => {
            videoModalEl.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => {
                const body = document.getElementById('video-modal-body');
                if (body) body.innerHTML = '';
            }, 300);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);
        if (closeActionBtn) closeActionBtn.addEventListener('click', closeVideoModal);

        videoModalEl.addEventListener('click', (event) => {
            if (event.target === videoModalEl) {
                closeVideoModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && videoModalEl.classList.contains('show')) {
                closeVideoModal();
            }
        });
    }

    function openVideoModal(project, videoUrl) {
        initVideoModal();

        const titleTextEl = document.getElementById('video-modal-title-text');
        const bodyEl = document.getElementById('video-modal-body');
        const subtitleEl = document.getElementById('video-modal-subtitle');
        const externalEl = document.getElementById('video-modal-external');

        const projectTitle = (project && project.title) ? project.title : 'Project';
        if (titleTextEl) titleTextEl.textContent = `${projectTitle} — Demo Video`;
        if (subtitleEl) subtitleEl.textContent = project.category ? `Category: ${project.category.charAt(0).toUpperCase() + project.category.slice(1)}` : 'Project Demonstration';

        const parsed = parseVideoUrl(videoUrl);

        if (bodyEl) {
            if (parsed && (parsed.type === 'youtube' || parsed.type === 'vimeo')) {
                bodyEl.innerHTML = `
                    <div class="video-modal-container">
                        <iframe src="${parsed.embedUrl}" title="${projectTitle} Demo Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                    </div>
                `;
            } else if (parsed && parsed.type === 'direct') {
                bodyEl.innerHTML = `
                    <div class="video-modal-container">
                        <video controls autoplay playsinline class="video-modal-player">
                            <source src="${parsed.embedUrl}">
                            Your browser does not support HTML video.
                        </video>
                    </div>
                `;
            } else {
                // Video Coming Soon / URL not set yet placeholder
                const links = Array.isArray(project && project.links) ? project.links : [];
                const otherLinks = links.filter((l) => {
                    const lbl = (l.label || '').toLowerCase();
                    return !lbl.includes('video') && !lbl.includes('demo') && l.url && l.url.trim() && l.url !== '#';
                });

                let otherLinksHtml = '';
                if (otherLinks.length > 0) {
                    otherLinksHtml = otherLinks.map((l) => `
                        <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.8rem; padding: 6px 14px;">
                            <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> ${l.label}
                        </a>
                    `).join('');
                }

                bodyEl.innerHTML = `
                    <div class="video-modal-placeholder">
                        <div class="video-modal-placeholder-icon">
                            <i class="fas fa-circle-play" aria-hidden="true"></i>
                        </div>
                        <h4>Demo Video Coming Soon</h4>
                        <p>The demonstration video for <strong>${projectTitle}</strong> is currently being prepared and will be available here shortly.</p>
                        ${otherLinksHtml ? `
                        <div style="margin-top: 6px;">
                            <span style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-bottom: 8px;">Explore project resources:</span>
                            <div class="video-modal-placeholder-links">${otherLinksHtml}</div>
                        </div>
                        ` : ''}
                    </div>
                `;
            }
        }

        if (externalEl) {
            if (parsed && parsed.rawUrl) {
                externalEl.href = parsed.rawUrl;
                externalEl.style.display = 'inline-flex';
            } else {
                externalEl.style.display = 'none';
            }
        }

        videoModalEl.classList.add('show');
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
            web: 'Web',
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

        // Render preview grid on homepage (index.html) - Featured Activities
        const renderPreviewGrid = (grid, activities) => {
            if (!grid) return;
            grid.innerHTML = '';

            // Filter first 3 projects where featured is true (fallback to first 3 if none flagged)
            const featuredActivities = activities.filter((a) => a.featured === true).slice(0, 3);
            const previewItems = featuredActivities.length > 0 ? featuredActivities : activities.slice(0, 3);

            previewItems.forEach((activity) => {
                const category = categoryNormalize(activity.category);
                const isMobile = category === 'mobile';
                const statusInfo = statusNormalize(activity.status);
                const stack = Array.isArray(activity.stack) ? activity.stack : (Array.isArray(activity.tech) ? activity.tech : []);
                const links = Array.isArray(activity.links) ? activity.links : [];
                const screenshots = Array.isArray(activity.screenshots) ? activity.screenshots : [];

                // Primary link for browser address bar & title link (live demo links are always the last entry)
                const primaryLink = (links.length > 0 ? links[links.length - 1] : null);
                const primaryUrl = primaryLink ? primaryLink.url : '#';
                const displayHost = getDomainFromUrl(primaryUrl, activity.title);
                const fallbackUri = getFallbackSvgDataUri(activity.title, category);

                // Top: image area, 16:10, rounded corners
                const statusBadgeHtml = `
                    <span class="featured-status-badge status-${statusInfo.slug}">
                        <span class="status-dot"></span>
                        <span>${statusInfo.label}</span>
                    </span>
                `;

                let mediaHtml = '';
                if (isMobile) {
                    const screen1 = screenshots[0] || 'assets/images/works/diunotes1.jpg';
                    const screen2 = screenshots[1] || screenshots[0] || 'assets/images/works/diunotes2.jpg';

                    mediaHtml = `
                        <div class="featured-media-area">
                            <div class="featured-phones-container">
                                <div class="featured-phone-mockup featured-phone-mockup-left">
                                    <div class="featured-phone-notch" aria-hidden="true"></div>
                                    <div class="featured-phone-screen">
                                        <img src="${screen1}" alt="${activity.title} - screenshot 1" loading="lazy" class="featured-phone-img" onerror="this.onerror=null;this.src='${fallbackUri}';">
                                    </div>
                                </div>
                                <div class="featured-phone-mockup featured-phone-mockup-right">
                                    <div class="featured-phone-notch" aria-hidden="true"></div>
                                    <div class="featured-phone-screen">
                                        <img src="${screen2}" alt="${activity.title} - screenshot 2" loading="lazy" class="featured-phone-img" onerror="this.onerror=null;this.src='${fallbackUri}';">
                                    </div>
                                </div>
                            </div>
                            ${statusBadgeHtml}
                        </div>
                    `;
                } else {
                    const screen = screenshots[0] || fallbackUri;

                    mediaHtml = `
                        <div class="featured-media-area">
                            <div class="featured-browser-frame">
                                <div class="featured-browser-header">
                                    <div class="featured-browser-dots" aria-hidden="true">
                                        <span class="browser-dot dot-close"></span>
                                        <span class="browser-dot dot-minimize"></span>
                                        <span class="browser-dot dot-maximize"></span>
                                    </div>
                                    <div class="featured-browser-address-bar">
                                        <i class="fas fa-lock" aria-hidden="true"></i>
                                        <span class="featured-browser-url">${displayHost}</span>
                                    </div>
                                    <div class="featured-browser-actions" aria-hidden="true">
                                        <i class="fas fa-chevron-left"></i>
                                        <i class="fas fa-chevron-right"></i>
                                    </div>
                                </div>
                                <div class="featured-browser-viewport">
                                    <img src="${screen}" alt="${activity.title} preview" loading="lazy" class="featured-browser-img" onerror="this.onerror=null;this.src='${fallbackUri}';">
                                </div>
                            </div>
                            ${statusBadgeHtml}
                        </div>
                    `;
                }

                // Stack as small pill tags
                const stackPillsHtml = stack.map((tech) => `<span class="featured-stack-pill">${tech}</span>`).join('');

                // Links (Github Code, Demo Video, Live/Play Store)
                const linksHtml = links.map((link) => {
                    const lLower = (link.label || '').toLowerCase();
                    const uLower = (link.url || '').toLowerCase();
                    let iconClass = 'fas fa-arrow-up-right-from-square';
                    let isPrimary = false;
                    let isVideo = false;

                    if (lLower.includes('github') || uLower.includes('github.com')) {
                        iconClass = 'fab fa-github';
                    } else if (lLower.includes('video') || lLower.includes('demo') || uLower.includes('vimeo')) {
                        iconClass = 'fas fa-circle-play';
                        isVideo = true;
                    } else if (uLower.includes('youtube.com') || uLower.includes('youtu.be') || lLower.includes('youtube')) {
                        iconClass = 'fab fa-youtube';
                        isVideo = true;
                    } else if (lLower.includes('play') || lLower.includes('store') || uLower.includes('google.com')) {
                        iconClass = 'fab fa-google-play';
                        isPrimary = true;
                    } else if (lLower.includes('game') || category === 'game') {
                        iconClass = 'fas fa-gamepad';
                        isPrimary = true;
                    } else if (lLower.includes('live') || lLower.includes('visit') || lLower.includes('website')) {
                        iconClass = 'fas fa-external-link-alt';
                        isPrimary = true;
                    }

                    const safeHref = link.url && link.url.trim() ? link.url : '#';
                    const videoAttr = isVideo ? `data-video-action="true" data-project-id="${activity.id || ''}" data-video-url="${link.url || ''}"` : '';
                    const videoClass = isVideo ? 'featured-link-btn-video' : '';

                    return `
                        <a href="${safeHref}" ${link.url && link.url.trim() && !isVideo ? 'target="_blank" rel="noopener noreferrer"' : ''} class="featured-link-btn ${isPrimary ? 'primary' : ''} ${videoClass}" ${videoAttr}>
                            <i class="${iconClass}" aria-hidden="true"></i>
                            <span>${link.label}</span>
                        </a>
                    `;
                }).join('');

                // Contributors for Featured Preview Card
                const contributors = Array.isArray(activity.contributors) ? activity.contributors : [];
                let contributorsHtml = '';
                if (contributors.length > 0) {
                    const itemsHtml = contributors.map((c) => {
                        const cName = c.name || 'Contributor';
                        const cLink = c.link || c.url || c.profileUrl || '#';
                        const cImg = c.image || c.avatar || c.profileImage || 'assets/images/me.jpg';
                        const cContrib = c.contribution || c.description || c.role || '';
                        const hasLink = cLink && cLink !== '#';
                        const tooltip = cContrib ? `${cName}: ${cContrib}` : cName;

                        const content = `
                            <img src="${cImg}" alt="${cName}" loading="lazy" class="featured-contrib-avatar" onerror="this.onerror=null;this.src='assets/images/me.jpg';">
                            <div class="featured-contrib-text">
                                <span class="featured-contrib-name">${cName}</span>
                                ${cContrib ? `<span class="featured-contrib-role">${cContrib}</span>` : ''}
                            </div>
                        `;

                        if (hasLink) {
                            return `
                                <a href="${cLink}" target="_blank" rel="noopener noreferrer" class="featured-contrib-item" title="${tooltip}">
                                    ${content}
                                </a>
                            `;
                        } else {
                            return `
                                <div class="featured-contrib-item" title="${tooltip}">
                                    ${content}
                                </div>
                            `;
                        }
                    }).join('');

                    contributorsHtml = `
                        <div class="featured-contributors">
                            <span class="featured-contrib-label"><i class="fas fa-users" aria-hidden="true"></i> Contributors</span>
                            <div class="featured-contrib-list">
                                ${itemsHtml}
                            </div>
                        </div>
                    `;
                }

                const card = document.createElement('article');
                card.className = 'featured-activity-card';
                card.dataset.id = activity.id || '';
                card.dataset.category = category;

                card.innerHTML = `
                    ${mediaHtml}
                    <div class="featured-card-body">
                        <h3 class="featured-card-title">
                            ${primaryUrl !== '#' ? `<a href="${primaryUrl}" target="_blank" rel="noopener noreferrer">${activity.title}</a>` : activity.title}
                        </h3>
                        <p class="featured-card-desc" title="${(activity.description || '').replace(/"/g, '&quot;')}">${activity.description || ''}</p>
                        ${stack.length > 0 ? `<div class="featured-card-stack">${stackPillsHtml}</div>` : ''}
                        ${contributorsHtml}
                        ${links.length > 0 ? `
                        <div class="featured-card-footer">
                            <div class="featured-card-links">${linksHtml}</div>
                        </div>` : ''}
                    </div>
                `;

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
                const contributors = Array.isArray(project.contributors) ? project.contributors : [];

                const counterStr = `${padNumber(index + 1)} / ${padNumber(totalCount)}`;
                // Alternating rows: project 1 (index 0) text left / image right; project 2 (index 1) image left / text right
                const isReversed = index % 2 === 1;

                const itemEl = document.createElement('article');
                itemEl.className = `showcase-item ${isReversed ? 'is-reversed' : ''}`;
                itemEl.dataset.id = project.id || `project-${index}`;
                itemEl.dataset.category = category;

                // Primary link for browser address bar & title link
                // Primary link for browser address bar & title link (live demo links are always the last entry)
                const primaryLink = (links.length > 0 ? links[links.length - 1] : null);
                const primaryUrl = primaryLink ? primaryLink.url : '#';
                const displayHost = getDomainFromUrl(primaryUrl, project.title);

                // Build Stack HTML
                const stackHtml = stack.map((tech) => `<span class="stack-badge">${tech}</span>`).join('');

                // Build Contributors HTML
                let contributorsHtml = '';
                if (contributors.length > 0) {
                    const contributorCardsHtml = contributors.map((c) => {
                        const cName = c.name || 'Contributor';
                        const cLink = c.link || c.url || c.profileUrl || '#';
                        const cImg = c.image || c.avatar || c.profileImage || 'assets/images/me.jpg';
                        const cContrib = c.contribution || c.description || c.role || '';
                        const hasLink = cLink && cLink !== '#';
                        const fullTitle = cContrib ? `${cName} — ${cContrib}` : cName;

                        const content = `
                            <span class="contributor-avatar-wrap">
                                <img src="${cImg}" alt="${cName}" loading="lazy" class="contributor-avatar" onerror="this.onerror=null;this.src='assets/images/me.jpg';">
                            </span>
                            <span class="contributor-details">
                                <span class="contributor-name-row">
                                    <span class="contributor-name">${cName}</span>
                                    ${hasLink ? '<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>' : ''}
                                </span>
                                ${cContrib ? `<span class="contributor-contribution">${cContrib}</span>` : ''}
                            </span>
                        `;

                        if (hasLink) {
                            return `
                                <a href="${cLink}" target="_blank" rel="noopener noreferrer" class="showcase-contributor-card" title="${fullTitle}">
                                    ${content}
                                </a>
                            `;
                        } else {
                            return `
                                <div class="showcase-contributor-card" title="${fullTitle}">
                                    ${content}
                                </div>
                            `;
                        }
                    }).join('');

                    contributorsHtml = `
                        <div class="showcase-contributors">
                            <span class="showcase-contributors-heading">
                                <i class="fas fa-users" aria-hidden="true"></i> Contributors
                            </span>
                            <div class="showcase-contributors-list">
                                ${contributorCardsHtml}
                            </div>
                        </div>
                    `;
                }

                // Build Links HTML
                const linksHtml = links.map((link, lIdx) => {
                    const lLower = (link.label || '').toLowerCase();
                    const uLower = (link.url || '').toLowerCase();
                    let iconClass = 'fas fa-arrow-up-right-from-square';
                    let isVideo = false;

                    if (lLower.includes('github') || uLower.includes('github.com')) {
                        iconClass = 'fab fa-github';
                    } else if (lLower.includes('video') || lLower.includes('demo') || uLower.includes('vimeo')) {
                        iconClass = 'fas fa-circle-play';
                        isVideo = true;
                    } else if (uLower.includes('youtube.com') || uLower.includes('youtu.be') || lLower.includes('youtube')) {
                        iconClass = 'fab fa-youtube';
                        isVideo = true;
                    } else if (lLower.includes('play') || lLower.includes('store') || uLower.includes('google.com')) {
                        iconClass = 'fab fa-google-play';
                    } else if (lLower.includes('game') || category === 'game') {
                        iconClass = 'fas fa-gamepad';
                    } else if (lLower.includes('live') || lLower.includes('web') || lLower.includes('site')) {
                        iconClass = 'fas fa-arrow-up-right-from-square';
                    }

                    const btnClass = lIdx === 0 ? 'showcase-btn showcase-btn-primary' : 'showcase-btn showcase-btn-secondary';
                    const videoClass = isVideo ? 'showcase-btn-video' : '';
                    const safeHref = link.url && link.url.trim() ? link.url : '#';
                    const videoAttr = isVideo ? `data-video-action="true" data-project-id="${project.id || ''}" data-video-url="${link.url || ''}"` : '';

                    return `
                        <a href="${safeHref}" ${link.url && link.url.trim() && !isVideo ? 'target="_blank" rel="noopener noreferrer"' : ''} class="${btnClass} ${videoClass}" ${videoAttr}>
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
                        ${contributorsHtml}
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

                const handleVideoClick = (event) => {
                    const videoBtn = event.target.closest('[data-video-action="true"]');
                    if (videoBtn) {
                        event.preventDefault();
                        const videoUrl = videoBtn.dataset.videoUrl || '';
                        const projectId = videoBtn.dataset.projectId;
                        const project = allActivities.find((p) => (p.id || '') === projectId) || {
                            title: videoBtn.closest('article')?.querySelector('h2, h3')?.textContent?.trim() || 'Project Demo',
                            links: []
                        };
                        openVideoModal(project, videoUrl);
                    }
                };

                // Render preview grid (homepage)
                if (activitiesPreviewGrid) {
                    renderPreviewGrid(activitiesPreviewGrid, allActivities);
                    activitiesPreviewGrid.addEventListener('click', handleVideoClick);
                }

                // Render showcase list (activities.html)
                if (showcaseList) {
                    renderShowcase(showcaseList, allActivities);
                    showcaseList.addEventListener('click', handleVideoClick);
                } else if (activitiesGrid) {
                    // Fallback for legacy activitiesGrid if ever loaded
                    renderPreviewGrid(activitiesGrid, allActivities);
                    activitiesGrid.addEventListener('click', handleVideoClick);
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
            hackathon: { label: 'Hackathon', icon: 'fas fa-rocket' },
            contest: { label: 'Contest', icon: 'fas fa-trophy' },
            productivity: { label: 'Productivity', icon: 'fas fa-file-alt' }
        };

        const filtersContainer = document.getElementById('certificates-filters');
        let activeCategory = 'all';

        const renderCertificates = (certificates) => {
            accordionContainer.innerHTML = '';

            if (!certificates || certificates.length === 0) {
                renderInfoCard('No certificates match your current filter.');
                return;
            }

            certificates.forEach((certificate) => {
                const catKey = (certificate.category || 'general').toLowerCase();
                const cat = categoryMap[catKey] || {
                    label: certificate.category ? (certificate.category.charAt(0).toUpperCase() + certificate.category.slice(1)) : 'General',
                    icon: 'fas fa-certificate'
                };

                const triggerLightbox = (event) => {
                    if (event) event.preventDefault();
                    openCertificateLightbox(certificate, imageBasePath);
                };

                const certIcon = (certificate.icon && typeof certificate.icon === 'string' && certificate.icon.trim())
                    ? certificate.icon.trim()
                    : (cat.icon || 'fas fa-certificate');

                const card = document.createElement('article');
                card.className = 'cert-card';

                // 1. Framed Preview Media
                const mediaBtn = document.createElement('button');
                mediaBtn.type = 'button';
                mediaBtn.className = 'cert-card-media';
                mediaBtn.setAttribute('aria-label', `Inspect ${certificate.title || 'certificate'}`);
                mediaBtn.addEventListener('click', triggerLightbox);

                if (certificate.image) {
                    const img = document.createElement('img');
                    img.className = 'cert-card-img';
                    img.src = `${imageBasePath}${certificate.image}`;
                    img.alt = certificate.alt || certificate.title || 'Certificate preview';
                    img.loading = 'lazy';
                    mediaBtn.appendChild(img);
                }

                const badgesRow = document.createElement('div');
                badgesRow.className = 'cert-card-badges';
                badgesRow.innerHTML = `<span class="cert-cat-pill"><i class="${escapeHtml(cat.icon)}" aria-hidden="true"></i> ${escapeHtml(cat.label)}</span>`;
                if (certificate.featured) {
                    badgesRow.innerHTML += `<span class="cert-featured-pill"><i class="fas fa-star" aria-hidden="true"></i> Featured</span>`;
                }
                mediaBtn.appendChild(badgesRow);

                const mediaOverlay = document.createElement('div');
                mediaOverlay.className = 'cert-card-media-overlay';
                mediaOverlay.innerHTML = '<span class="cert-zoom-hint"><i class="fas fa-expand" aria-hidden="true"></i> Inspect</span>';
                mediaBtn.appendChild(mediaOverlay);

                card.appendChild(mediaBtn);

                // 2. Title & Issuer Body
                const body = document.createElement('div');
                body.className = 'cert-card-body';
                body.innerHTML = `
                    <span class="cert-icon-box" aria-hidden="true"><i class="${escapeHtml(certIcon)}"></i></span>
                    <div class="cert-title-wrap">
                        <h3 class="cert-card-title">${escapeHtml(certificate.title || 'Untitled Certificate')}</h3>
                        <p class="cert-card-issuer">Issued by <strong>${escapeHtml(certificate.issuer || 'Verified Organization')}</strong></p>
                    </div>
                `;
                card.appendChild(body);

                // 3. Footer Actions
                const footer = document.createElement('div');
                footer.className = 'cert-card-footer';

                const inspectBtn = document.createElement('button');
                inspectBtn.type = 'button';
                inspectBtn.className = 'cert-btn cert-btn-inspect';
                inspectBtn.innerHTML = '<i class="fas fa-search-plus" aria-hidden="true"></i> <span>Inspect</span>';
                inspectBtn.title = 'Inspect full-size certificate';
                inspectBtn.addEventListener('click', triggerLightbox);
                footer.appendChild(inspectBtn);

                if (certificate.verifyUrl && certificate.verifyUrl !== '#') {
                    const verifyLink = document.createElement('a');
                    verifyLink.href = certificate.verifyUrl;
                    verifyLink.target = '_blank';
                    verifyLink.rel = 'noopener noreferrer';
                    verifyLink.className = 'cert-btn cert-btn-verify';
                    verifyLink.innerHTML = '<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> <span>Verify</span>';
                    verifyLink.title = 'Verify certificate online';
                    footer.appendChild(verifyLink);
                }

                card.appendChild(footer);
                accordionContainer.appendChild(card);
            });
        };

        const renderFilters = (allCertificates) => {
            if (!filtersContainer || certificatesLimit !== null) return;
            const categories = ['all'];
            allCertificates.forEach((c) => {
                const key = (c && c.category ? String(c.category).toLowerCase() : 'general');
                if (!categories.includes(key)) categories.push(key);
            });

            filtersContainer.innerHTML = '';
            categories.forEach((key) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `cert-filter-pill${key === activeCategory ? ' active' : ''}`;
                const count = key === 'all'
                    ? allCertificates.length
                    : allCertificates.filter((c) => (c && c.category ? String(c.category).toLowerCase() : 'general') === key).length;
                const info = categoryMap[key] || { label: key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1) };
                btn.textContent = `${info.label} (${count})`;
                btn.addEventListener('click', () => {
                    activeCategory = key;
                    filtersContainer.querySelectorAll('.cert-filter-pill').forEach((el) => el.classList.remove('active'));
                    btn.classList.add('active');
                    const filtered = key === 'all'
                        ? allCertificates
                        : allCertificates.filter((c) => (c && c.category ? String(c.category).toLowerCase() : 'general') === key);
                    renderCertificates(filtered);
                });
                filtersContainer.appendChild(btn);
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

                renderFilters(allCertificates);
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
                    p.innerHTML = `${escapeHtml(item.degree || '')}${item.result ? ` <span class="timeline-result-pill">${escapeHtml(item.result)}</span>` : ''}`.trim();
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

    /* --- Escape HTML Helper --- */
    function escapeHtml(str) {
        if (typeof str !== 'string') return String(str ?? '');
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }

    /* --- Intro & Hero Section Rendering from intro.json --- */
    function initIntroFromJson() {
        const heroSection = document.getElementById('home');
        if (!heroSection) return;

        const sourcePath = heroSection.dataset.introSource || 'data/intro.json';

        fetchJsonWithFallback([
            sourcePath,
            'data/intro.json',
            './data/intro.json',
            'intro.json',
            './intro.json',
            '../data/intro.json'
        ]).then((data) => {
            if (!data) return;

            // 1. Status Badge
            if (data.badge) {
                const badgeTextEl = document.getElementById('hero-badge-text');
                if (badgeTextEl && data.badge.text) {
                    badgeTextEl.textContent = data.badge.text;
                }
                const badgeDotEl = document.getElementById('hero-badge-dot');
                if (badgeDotEl && data.badge.showPulse === false) {
                    badgeDotEl.style.display = 'none';
                }
                const badgeEl = document.getElementById('hero-badge');
                if (badgeEl && data.badge.url) {
                    badgeEl.style.cursor = 'pointer';
                    badgeEl.onclick = () => { window.location.href = data.badge.url; };
                }
            }

            // 2. Heading, Role, and Description
            if (data.heading) {
                const titleEl = document.getElementById('hero-title');
                if (titleEl && (data.heading.firstName || data.heading.lastName)) {
                    const first = data.heading.firstName || '';
                    const last = data.heading.lastName || '';
                    titleEl.innerHTML = `${escapeHtml(first)} <span class="highlight">${escapeHtml(last)}</span>`;
                }

                const roleEl = document.getElementById('hero-role');
                if (roleEl && data.heading.role) {
                    const prefix = data.heading.rolePrefix || '//';
                    roleEl.innerHTML = `<span class="hero-role-slash">${escapeHtml(prefix)}</span> ${escapeHtml(data.heading.role)}`;
                }

                const descEl = document.getElementById('hero-description');
                if (descEl && data.heading.description) {
                    descEl.textContent = data.heading.description;
                }
            }

            // 3. Tech Stack Tags / Chips
            if (Array.isArray(data.tags)) {
                const stackContainer = document.getElementById('hero-stack-chips');
                if (stackContainer) {
                    stackContainer.innerHTML = '';
                    data.tags.forEach((tag) => {
                        if (!tag || !tag.name) return;
                        const chip = document.createElement('span');
                        chip.className = 'hero-tech-chip';
                        const iconHtml = tag.icon ? `<i class="${escapeHtml(tag.icon)}" aria-hidden="true"></i> ` : '';
                        chip.innerHTML = `${iconHtml}${escapeHtml(tag.name)}`;
                        stackContainer.appendChild(chip);
                    });
                }
            }

            // 4. Action Buttons
            if (Array.isArray(data.buttons)) {
                const buttonsContainer = document.getElementById('hero-buttons');
                if (buttonsContainer) {
                    buttonsContainer.innerHTML = '';
                    data.buttons.forEach((btn) => {
                        if (!btn || !btn.text) return;
                        const a = document.createElement('a');
                        a.href = btn.url || '#';
                        a.className = `btn btn-${btn.style || 'primary'}`;
                        if (btn.target) a.target = btn.target;
                        if (btn.target === '_blank') a.rel = 'noopener noreferrer';
                        const iconHtml = btn.icon ? `<i class="${escapeHtml(btn.icon)}" aria-hidden="true"></i> ` : '';
                        a.innerHTML = `${iconHtml}${escapeHtml(btn.text)}`;
                        buttonsContainer.appendChild(a);
                    });
                }
            }

            // 5. Social Links
            if (Array.isArray(data.socialLinks)) {
                const socialsContainer = document.getElementById('hero-social-row');
                if (socialsContainer) {
                    socialsContainer.innerHTML = '';
                    data.socialLinks.forEach((link) => {
                        if (!link || !link.label) return;
                        const a = document.createElement('a');
                        a.href = link.url || '#';
                        a.className = 'hero-social-link';
                        a.title = link.title || link.label;
                        if (link.target) a.target = link.target;
                        if (link.target === '_blank') a.rel = 'noopener noreferrer';
                        const iconHtml = link.icon ? `<i class="${escapeHtml(link.icon)}" aria-hidden="true"></i> ` : '';
                        a.innerHTML = `${iconHtml}<span>${escapeHtml(link.label)}</span>`;
                        socialsContainer.appendChild(a);
                    });
                }
            }

            // 6. Bento Developer Profile Card
            if (data.bentoCard) {
                const bc = data.bentoCard;

                // File label in topbar
                const fileLabelEl = document.getElementById('bento-file-label');
                if (fileLabelEl && bc.fileName) {
                    fileLabelEl.innerHTML = `<i class="fas fa-code"></i> ${escapeHtml(bc.fileName)}`;
                }

                // Location badge in topbar
                const locBadgeEl = document.getElementById('bento-badge-loc');
                if (locBadgeEl && bc.location) {
                    locBadgeEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${escapeHtml(bc.location)}`;
                }

                // Avatar
                const avatarImg = document.getElementById('bento-avatar-img');
                if (avatarImg && bc.avatar) {
                    avatarImg.src = bc.avatar;
                }
                const avatarLink = document.getElementById('bento-avatar-link');
                if (avatarLink && bc.avatarUrl) {
                    avatarLink.href = bc.avatarUrl;
                }

                // Name & Handle
                const nameEl = document.getElementById('bento-name');
                if (nameEl && bc.name) {
                    nameEl.textContent = bc.name;
                }
                const handleEl = document.getElementById('bento-handle');
                if (handleEl && bc.handle) {
                    handleEl.textContent = bc.handle.startsWith('@') ? bc.handle : `@${bc.handle}`;
                }

                // Institution
                const instEl = document.getElementById('bento-inst');
                if (instEl && bc.institution) {
                    instEl.textContent = bc.institution;
                }

                // Focus Tag
                const focusEl = document.getElementById('bento-focus-tag');
                if (focusEl && bc.focusTag) {
                    focusEl.innerHTML = `<i class="fas fa-terminal"></i> ${escapeHtml(bc.focusTag)}`;
                }

                // Stat Tiles (auto-synced with works & certificates JSON)
                if (Array.isArray(bc.statTiles)) {
                    const statsGrid = document.getElementById('bento-stats-grid');
                    if (statsGrid) {
                        statsGrid.innerHTML = '';
                        const tileValEls = {};
                        bc.statTiles.forEach((tile) => {
                            if (!tile) return;
                            const tileEl = document.createElement('a');
                            tileEl.href = tile.url || '#';
                            tileEl.className = 'bento-stat-tile';
                            if (tile.title || tile.label) tileEl.title = tile.title || tile.label;
                            if (tile.target) tileEl.target = tile.target;
                            if (tile.target === '_blank') tileEl.rel = 'noopener noreferrer';

                            const valIcon = tile.icon ? `<i class="${escapeHtml(tile.icon)}"></i>` : '';
                            const valText = tile.value ? escapeHtml(tile.value) : '';
                            const lblText = tile.label ? escapeHtml(tile.label) : '';

                            tileEl.innerHTML = `
                                <div class="bento-stat-val">${valIcon}<span class="bento-stat-num">${valText}</span></div>
                                <div class="bento-stat-lbl">${lblText}</div>
                            `;
                            statsGrid.appendChild(tileEl);

                            const numEl = tileEl.querySelector('.bento-stat-num');
                            const keyHint = (tile.key || tile.label || '').toLowerCase();
                            if (keyHint.includes('project')) tileValEls.projects = numEl;
                            else if (keyHint.includes('app') || keyHint.includes('mobile')) tileValEls.apps = numEl;
                            else if (keyHint.includes('cert')) tileValEls.certificates = numEl;
                            else if (keyHint.includes('repo')) tileValEls.repos = numEl;
                        });

                        Promise.all([
                            fetchJsonWithFallback(['data/myWorks.json', './data/myWorks.json', 'myWorks.json']).catch(() => null),
                            fetchJsonWithFallback(['data/myCertificates.json', './data/myCertificates.json', 'myCertificates.json']).catch(() => null)
                        ]).then(([worksData, certsData]) => {
                            const worksArr = Array.isArray(worksData) ? worksData : (worksData && worksData.works ? worksData.works : []);
                            const certsArr = Array.isArray(certsData) ? certsData : [];
                            if (worksArr.length > 0) {
                                if (tileValEls.projects) tileValEls.projects.textContent = ` ${worksArr.length}`;
                                if (tileValEls.apps) {
                                    const mobileCount = worksArr.filter((w) => (w.category || '').toLowerCase() === 'mobile').length;
                                    tileValEls.apps.textContent = ` ${mobileCount}`;
                                }
                            }
                            if (certsArr.length > 0 && tileValEls.certificates) {
                                tileValEls.certificates.textContent = ` ${certsArr.length}`;
                            }
                        });
                    }
                }

            }
        }).catch((err) => {
            console.warn('Could not load intro.json data:', err);
        });
    }

    /* --- Profile Details & Stats Rendering from JSON --- */
    function initProfileFromJson() {
        const profileContainer = document.getElementById('profile-hero-card');
        if (!profileContainer) return;

        const sourcePath = profileContainer.dataset.profileSource || 'data/myProfile.json';

        // Fetch profile JSON with fallbacks
        fetchJsonWithFallback([sourcePath, 'data/myProfile.json', './data/myProfile.json', './myProfile.json'])
            .then((profile) => {
                if (!profile) return;

            // Heading
            const headingEl = document.getElementById('profile-heading');
            if (headingEl && profile.heading) {
                const first = escapeHtml(profile.heading.first || 'About');
                const highlight = escapeHtml(profile.heading.highlight || 'Me');
                headingEl.innerHTML = `${first} <span class="highlight">${highlight}</span>`;
            }

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
                locEl.innerHTML = `<i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${escapeHtml(profile.location)}`;
            }

            // Institution
            const instEl = document.getElementById('profile-institution');
            if (instEl && profile.institution) {
                instEl.innerHTML = `<i class="fas fa-university" aria-hidden="true"></i> ${escapeHtml(profile.institution)}`;
            }

            // Core focus
            const focusEl = document.getElementById('profile-focus');
            if (focusEl && profile.focus) {
                focusEl.innerHTML = `<i class="fas fa-microchip" aria-hidden="true"></i> ${escapeHtml(profile.focus)}`;
            }

            // Status
            const statusEl = document.getElementById('profile-status');
            if (statusEl && profile.status) {
                statusEl.innerHTML = `<span class="status-pulse-dot" aria-hidden="true"></span><span>${escapeHtml(profile.status)}</span>`;
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

            // Identity Card Metadata
            if (profile.identityCard) {
                const ic = profile.identityCard;
                const fileEl = document.getElementById('profile-card-filename');
                if (fileEl && ic.fileName) {
                    fileEl.innerHTML = `<i class="fas fa-id-card" aria-hidden="true"></i> ${escapeHtml(ic.fileName)}`;
                }
                const subEl = document.getElementById('profile-card-subtitle');
                if (subEl && ic.subtitle) {
                    subEl.textContent = ic.subtitle;
                }
                const tagEl = document.getElementById('profile-card-tag');
                if (tagEl && ic.tag) {
                    const tagIcon = ic.tagIcon ? escapeHtml(ic.tagIcon) : 'fas fa-terminal';
                    tagEl.innerHTML = `<i class="${tagIcon}" aria-hidden="true"></i> ${escapeHtml(ic.tag)}`;
                }
            }

            // Hero CTA Actions
            const actionsEl = document.getElementById('profile-actions');
            if (actionsEl && Array.isArray(profile.actions)) {
                actionsEl.innerHTML = '';
                profile.actions.forEach((btn) => {
                    if (!btn || !btn.text) return;
                    const a = document.createElement('a');
                    a.href = btn.url || '#';
                    a.className = `btn ${btn.style === 'outline' ? 'btn-outline' : 'btn-primary'}`;
                    if (btn.target) a.target = btn.target;
                    if (btn.target === '_blank') a.rel = 'noopener noreferrer';
                    const iconHtml = btn.icon ? `<i class="${escapeHtml(btn.icon)}" aria-hidden="true"></i> ` : '';
                    a.innerHTML = `${iconHtml}${escapeHtml(btn.text)}`;
                    actionsEl.appendChild(a);
                });
            }

            // Engineering Focus Pillars
            const focusStripEl = document.getElementById('about-focus-strip');
            if (focusStripEl && Array.isArray(profile.focusAreas)) {
                focusStripEl.innerHTML = '';
                profile.focusAreas.forEach((area) => {
                    if (!area) return;
                    const card = document.createElement('article');
                    card.className = 'about-focus-card';
                    card.innerHTML = `
                        <div class="about-focus-icon"><i class="${escapeHtml(area.icon || 'fas fa-code')}" aria-hidden="true"></i></div>
                        <div>
                            <h3 class="about-focus-title">${escapeHtml(area.title || '')}</h3>
                            <p class="about-focus-desc">${escapeHtml(area.description || '')}</p>
                        </div>
                    `;
                    focusStripEl.appendChild(card);
                });
            }

            // Section Headings, Subtitles, Icons & Badges
            if (profile.sections) {
                const hydrateSectionHeader = (prefix, cfg) => {
                    if (!cfg) return;
                    const titleEl = document.getElementById(`about-${prefix}-title`);
                    const subEl = document.getElementById(`about-${prefix}-sub`);
                    const iconEl = document.getElementById(`about-${prefix}-icon`);
                    const badgeEl = document.getElementById(`about-${prefix}-badge`);
                    const actionEl = document.getElementById(`about-${prefix}-action`);

                    if (titleEl && cfg.title) titleEl.textContent = cfg.title;
                    if (subEl && cfg.subtitle) subEl.textContent = cfg.subtitle;
                    if (iconEl && cfg.icon) iconEl.innerHTML = `<i class="${escapeHtml(cfg.icon)}" aria-hidden="true"></i>`;
                    if (badgeEl && cfg.badge) badgeEl.textContent = cfg.badge;
                    if (actionEl && cfg.actionText) {
                        if (cfg.actionUrl) actionEl.href = cfg.actionUrl;
                        if (cfg.actionTarget) actionEl.target = cfg.actionTarget;
                        if (cfg.actionTarget === '_blank') actionEl.rel = 'noopener noreferrer';
                        actionEl.innerHTML = `${escapeHtml(cfg.actionText)} <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>`;
                    }
                };
                hydrateSectionHeader('skills', profile.sections.skills);
                hydrateSectionHeader('education', profile.sections.education);
                hydrateSectionHeader('links', profile.sections.links);
            }
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

    /* --- Shared Mini-Game Stage Helpers (Theme Sync, Storage & Canvas Geometry) --- */
    function createStageThemeHelper(stageEl, onThemeChange) {
        const palette = {
            bg: '#0d0d0d',
            surface: '#141414',
            border: '#262626',
            ink: '#f5f5f5',
            visor: '#0d0d0d',
            accent: '#22c55e',
            accentSoft: 'rgba(34, 197, 94, 0.35)',
            track: '#161616',
            trackDot: '#1f1f1f',
            danger: '#ef4444'
        };

        const sync = () => {
            const styles = window.getComputedStyle(stageEl);
            const pick = (name, fallback) => {
                const v = styles.getPropertyValue(name);
                return v ? v.trim() || fallback : fallback;
            };
            palette.bg = pick('--gr-bg', '#0d0d0d');
            palette.surface = pick('--gr-surface', '#141414');
            palette.border = pick('--gr-border', '#262626');
            palette.ink = pick('--gr-ink', '#f5f5f5');
            palette.visor = pick('--gr-visor', palette.bg);
            palette.accent = pick('--gr-accent', '#22c55e');
            palette.accentSoft = pick('--gr-accent-soft', 'rgba(34, 197, 94, 0.35)');
            palette.track = pick('--gr-track', '#161616');
            palette.trackDot = pick('--gr-track-dot', '#1f1f1f');
            palette.danger = pick('--gr-danger', '#ef4444');
        };

        if (window.MutationObserver) {
            const observer = new MutationObserver(() => {
                sync();
                if (typeof onThemeChange === 'function') onThemeChange();
            });
            observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-current-theme'] });
        }

        sync();
        return { palette, sync };
    }

    function traceRoundedRectPath(ctx, x, y, w, h, r) {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function readHighScoreStorage(key) {
        try {
            const raw = parseInt(localStorage.getItem(key) || '0', 10);
            return Number.isFinite(raw) && raw > 0 ? raw : 0;
        } catch (e) {
            return 0;
        }
    }

    function writeHighScoreStorage(key, val) {
        try {
            localStorage.setItem(key, String(val));
        } catch (e) {
            // Ignore storage failures in restricted contexts
        }
    }

    function formatMiniGameScore(val) {
        return String(Math.max(0, Math.floor(val))).padStart(4, '0');
    }

    /* --- Git Runner Endless Runner Mini-Game Widget --- */
    function initGitRunner() {
        const widget = document.getElementById('git-runner-widget');
        const stage = document.getElementById('git-runner-stage');
        const controlsEl = document.getElementById('git-runner-controls');
        const closeBtn = document.getElementById('git-runner-close');
        const canvasWrap = document.getElementById('git-runner-canvas-wrap');
        const canvas = document.getElementById('git-runner-canvas');
        const duckBtn = document.getElementById('git-runner-duck-btn');
        const scoreEl = document.getElementById('git-runner-score');
        const hiEl = document.getElementById('git-runner-hi');
        const startOverlay = document.getElementById('git-runner-start-overlay');
        const overlay = document.getElementById('git-runner-overlay');
        const finalScoreEl = document.getElementById('git-runner-final-score');

        if (!widget || !stage || !canvas || !canvasWrap || !startOverlay) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const STORAGE_KEY = 'gitRunnerHighScore';
        const GRAVITY = 1550;
        const FAST_FALL_GRAVITY = 3200;
        const JUMP_VELOCITY = -450;
        const BASE_SPEED = 205;
        const MAX_SPEED = 430;
        const FLYING_SCORE_THRESHOLD = 120;

        const GROUND_OBSTACLE_SPECS = [
            { kind: 'react', w: 24, h: 24 },
            { kind: 'ts', w: 22, h: 22 },
            { kind: 'cpp', w: 26, h: 23 },
            { kind: 'godot', w: 24, h: 24 },
            { kind: 'js', w: 22, h: 22 },
            { kind: 'code', w: 28, h: 20 }
        ];

        // mode: 'autopilot' | 'playing' | 'gameover'
        let mode = 'autopilot';
        let gameOverAt = 0;
        let rafId = null;
        let lastTime = 0;
        let isInViewport = true;
        let resizeObserver = null;
        let intersectionObserver = null;

        let viewW = 360;
        let viewH = 104;
        let groundY = 88;

        let scoreFloat = 0;
        let score = 0;
        let highScore = readHighScore();
        let isNewHigh = false;
        let speed = BASE_SPEED;
        let groundOffset = 0;
        let animTimer = 0;
        let animFrame = 0;
        let spawnGap = 100;
        let demoSpawnCount = 0;
        let obstacles = [];

        let keyDuck = false;
        let touchDuck = false;
        let swipeDuckTimer = 0;
        let touchStartY = null;

        const player = {
            x: 28,
            y: 88,
            vy: 0,
            onGround: true,
            ducking: false
        };

        const themePalette = {
            bg: '#0d0d0d',
            surface: '#141414',
            border: '#262626',
            ink: '#f5f5f5',
            visor: '#0d0d0d',
            accent: '#22c55e',
            accentSoft: 'rgba(34, 197, 94, 0.35)',
            track: '#161616',
            trackDot: '#1f1f1f',
            danger: '#ef4444'
        };

        function syncThemePalette() {
            const styles = window.getComputedStyle(stage);
            const pick = (name, fallback) => {
                const v = styles.getPropertyValue(name);
                return v ? v.trim() || fallback : fallback;
            };
            themePalette.bg = pick('--gr-bg', '#0d0d0d');
            themePalette.surface = pick('--gr-surface', '#141414');
            themePalette.border = pick('--gr-border', '#262626');
            themePalette.ink = pick('--gr-ink', '#f5f5f5');
            themePalette.visor = pick('--gr-visor', themePalette.bg);
            themePalette.accent = pick('--gr-accent', '#22c55e');
            themePalette.accentSoft = pick('--gr-accent-soft', 'rgba(34, 197, 94, 0.35)');
            themePalette.track = pick('--gr-track', '#161616');
            themePalette.trackDot = pick('--gr-track-dot', '#1f1f1f');
            themePalette.danger = pick('--gr-danger', '#ef4444');
        }

        function readHighScore() {
            try {
                const raw = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
                return Number.isFinite(raw) && raw > 0 ? raw : 0;
            } catch (e) {
                return 0;
            }
        }

        function writeHighScore(val) {
            try {
                localStorage.setItem(STORAGE_KEY, String(val));
            } catch (e) {
                // Ignore storage failures in restricted contexts
            }
        }

        function formatScore(val) {
            return String(Math.max(0, Math.floor(val))).padStart(4, '0');
        }

        function updateHudScores() {
            if (scoreEl) scoreEl.textContent = formatScore(score);
            if (hiEl) hiEl.textContent = `HI ${formatScore(highScore)}`;
        }

        function syncCanvasSize() {
            const w = Math.max(220, canvasWrap.clientWidth || 360);
            const h = Math.max(80, canvasWrap.clientHeight || 104);
            const dpr = Math.min(window.devicePixelRatio || 1, 3);
            const targetW = Math.round(w * dpr);
            const targetH = Math.round(h * dpr);

            if (canvas.width !== targetW || canvas.height !== targetH) {
                canvas.width = targetW;
                canvas.height = targetH;
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const prevGroundY = groundY;
            viewW = w;
            viewH = h;
            groundY = Math.round(viewH - 16);

            if (player.onGround) {
                player.y = groundY;
            } else {
                player.y += groundY - prevGroundY;
            }
        }

        function resetWorld(forAutopilot) {
            isNewHigh = false;
            scoreFloat = 0;
            score = 0;
            speed = forAutopilot ? BASE_SPEED + 18 : BASE_SPEED;
            groundOffset = 0;
            animTimer = 0;
            animFrame = 0;
            demoSpawnCount = 0;
            obstacles = [];
            spawnGap = forAutopilot
                ? Math.min(110, viewW * 0.35)
                : Math.max(170, viewW * 0.52);

            keyDuck = false;
            touchDuck = false;
            swipeDuckTimer = 0;
            if (duckBtn) duckBtn.classList.remove('is-active');

            player.y = groundY;
            player.vy = 0;
            player.onGround = true;
            player.ducking = false;

            if (overlay) overlay.hidden = true;
            updateHudScores();
        }

        function triggerJump() {
            if (mode === 'gameover') return;
            if (player.onGround) {
                player.vy = JUMP_VELOCITY;
                player.onGround = false;
                player.ducking = false;
                swipeDuckTimer = 0;
            }
        }

        function triggerRetry() {
            if (mode !== 'gameover') return;
            if (performance.now() - gameOverAt < 180) return;
            startPlaying();
        }

        function spawnObstacle() {
            const canSpawnFlying = mode === 'autopilot'
                ? demoSpawnCount >= 2
                : score >= FLYING_SCORE_THRESHOLD;
            demoSpawnCount += 1;

            if (canSpawnFlying && Math.random() < 0.34) {
                const isHigh = Math.random() < 0.58;
                const h = 15;
                // High drone passes cleanly above ducking runner (top = groundY - 15) while hitting standing runner (top = groundY - 26)
                const y = isHigh ? groundY - 33 : groundY - 19;
                obstacles.push({
                    type: 'flying',
                    isHigh: isHigh,
                    x: viewW + 14,
                    y: y,
                    w: 24,
                    h: h
                });
            } else {
                const spec = GROUND_OBSTACLE_SPECS[Math.floor(Math.random() * GROUND_OBSTACLE_SPECS.length)];
                obstacles.push({
                    type: 'ground',
                    kind: spec.kind,
                    x: viewW + 14,
                    y: groundY - spec.h,
                    w: spec.w,
                    h: spec.h
                });
            }

            const minGap = speed * 0.72 + 44;
            const maxGap = speed * 1.18 + 96;
            spawnGap = minGap + Math.random() * (maxGap - minGap);
        }

        function getAutopilotDecision() {
            let wantsDuck = false;
            let nearest = null;
            let minDist = Infinity;

            for (let i = 0; i < obstacles.length; i++) {
                const obs = obstacles[i];
                if (obs.x + obs.w < player.x + 2) continue;
                const dist = obs.x - (player.x + 22);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = obs;
                }
            }

            if (nearest) {
                if (nearest.type === 'flying' && nearest.isHigh) {
                    if (minDist < speed * 0.28 && nearest.x + nearest.w > player.x + 2) {
                        wantsDuck = true;
                    }
                } else {
                    const jumpLead = speed * 0.23;
                    if (player.onGround && minDist > -4 && minDist <= jumpLead) {
                        triggerJump();
                    }
                }
            }

            return wantsDuck;
        }

        function getPlayerHitbox() {
            if (player.onGround && player.ducking) {
                return {
                    x: player.x + 3,
                    y: groundY - 13,
                    w: 24,
                    h: 12
                };
            }
            return {
                x: player.x + 4,
                y: player.y - 23,
                w: 15,
                h: 21
            };
        }

        function boxesOverlap(a, b) {
            return (
                a.x < b.x + b.w &&
                a.x + a.w > b.x &&
                a.y < b.y + b.h &&
                a.y + a.h > b.y
            );
        }

        function handleGameOver() {
            mode = 'gameover';
            gameOverAt = performance.now();
            stopLoop();

            if (score > highScore) {
                highScore = score;
                isNewHigh = true;
                writeHighScore(highScore);
            }
            updateHudScores();

            if (finalScoreEl) {
                finalScoreEl.textContent = isNewHigh
                    ? `NEW HI // SCORE ${formatScore(score)}`
                    : `SCORE ${formatScore(score)}`;
            }
            if (overlay) overlay.hidden = false;
        }

        function update(dt) {
            let wantsDuck = false;
            if (mode === 'autopilot') {
                wantsDuck = getAutopilotDecision();
            } else {
                if (swipeDuckTimer > 0) {
                    swipeDuckTimer = Math.max(0, swipeDuckTimer - dt);
                }
                wantsDuck = keyDuck || touchDuck || swipeDuckTimer > 0;
            }
            player.ducking = wantsDuck;

            // Player vertical physics
            if (!player.onGround) {
                const g = wantsDuck ? FAST_FALL_GRAVITY : GRAVITY;
                player.vy += g * dt;
                player.y += player.vy * dt;
                if (player.y >= groundY) {
                    player.y = groundY;
                    player.vy = 0;
                    player.onGround = true;
                }
            }

            // Speed & score progression
            if (mode === 'playing') {
                scoreFloat += speed * 0.068 * dt;
                const nextScore = Math.floor(scoreFloat);
                if (nextScore !== score) {
                    score = nextScore;
                    if (score > highScore) {
                        highScore = score;
                        isNewHigh = true;
                    }
                    updateHudScores();
                }
                speed = Math.min(MAX_SPEED, BASE_SPEED + score * 0.24);
            }

            // Track scrolling & sprite cycle
            groundOffset = (groundOffset + speed * dt) % 24;
            animTimer += dt;
            const frameInterval = player.ducking ? 0.08 : 0.11;
            if (animTimer >= frameInterval) {
                animTimer -= frameInterval;
                animFrame = 1 - animFrame;
            }

            // Spawn & advance obstacles
            spawnGap -= speed * dt;
            if (spawnGap <= 0) {
                spawnObstacle();
            }

            const pBox = getPlayerHitbox();
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.x -= speed * dt;

                if (obs.x + obs.w < -20) {
                    obstacles.splice(i, 1);
                    continue;
                }

                if (mode === 'playing') {
                    const oBox = {
                        x: obs.x + 3,
                        y: obs.y + 3,
                        w: Math.max(6, obs.w - 6),
                        h: Math.max(6, obs.h - 5)
                    };
                    if (boxesOverlap(pBox, oBox)) {
                        handleGameOver();
                        return;
                    }
                }
            }
        }

        function traceRoundedRect(x, y, w, h, r) {
            const radius = Math.min(r, w / 2, h / 2);
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }

        function drawBackground() {
            ctx.fillStyle = themePalette.bg;
            ctx.fillRect(0, 0, viewW, viewH);

            // Subtle distant git branch track
            ctx.strokeStyle = themePalette.track;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 22);
            ctx.lineTo(viewW, 22);
            ctx.stroke();

            for (let x = -((groundOffset * 0.4) % 72); x < viewW + 10; x += 72) {
                ctx.fillStyle = themePalette.trackDot;
                ctx.beginPath();
                ctx.arc(x, 22, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Ground baseline
            ctx.strokeStyle = themePalette.border;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, groundY + 0.5);
            ctx.lineTo(viewW, groundY + 0.5);
            ctx.stroke();

            // Scrolling ground pebbles & theme-accent commit ticks
            for (let x = -groundOffset; x < viewW + 24; x += 24) {
                ctx.fillStyle = themePalette.border;
                ctx.fillRect(x, groundY + 5, 8, 1.5);
                ctx.fillStyle = themePalette.accentSoft;
                ctx.fillRect(x + 14, groundY + 8, 3, 1.5);
            }
        }

        function drawInvertocat() {
            const x = player.x;
            const y = player.y;

            if (player.onGround && player.ducking) {
                const top = groundY - 15;
                // Trailing tail
                ctx.strokeStyle = themePalette.ink;
                ctx.lineWidth = 2.2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x + 3, top + 7);
                ctx.quadraticCurveTo(x - 4, top + (animFrame === 0 ? 4 : 7), x - 6, top + 3);
                ctx.stroke();

                // Flattened crouching silhouette
                ctx.fillStyle = themePalette.ink;
                traceRoundedRect(x + 2, top + 3, 17, 9, 4.5);
                ctx.fill();

                // Forward head & flattened ears
                traceRoundedRect(x + 14, top + 1, 14, 10, 4.5);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x + 16, top + 2);
                ctx.lineTo(x + 13, top - 1);
                ctx.lineTo(x + 20, top + 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x + 22, top + 2);
                ctx.lineTo(x + 20, top - 1);
                ctx.lineTo(x + 26, top + 2);
                ctx.fill();

                // Accent collar highlight
                ctx.fillStyle = themePalette.accent;
                ctx.fillRect(x + 13, top + 10, 4, 1.5);

                // Visor & glowing accent eyes
                ctx.fillStyle = themePalette.visor;
                traceRoundedRect(x + 19, top + 4, 8, 4.5, 2);
                ctx.fill();
                ctx.fillStyle = themePalette.accent;
                ctx.fillRect(x + 21, top + 5.5, 2, 2);
                ctx.fillRect(x + 24.5, top + 5.5, 2, 2);

                // Scuttling legs
                ctx.fillStyle = themePalette.ink;
                const legShift = animFrame === 0 ? 0 : 3;
                ctx.fillRect(x + 6 + legShift, groundY - 3, 3, 3);
                ctx.fillRect(x + 16 - legShift, groundY - 3, 3, 3);
                return;
            }

            const bob = player.onGround ? (animFrame === 0 ? 0 : -1) : 0;
            const top = y - 26 + bob;

            // Tail
            ctx.strokeStyle = themePalette.ink;
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x + 5, top + 18);
            const tailSwing = player.onGround ? (animFrame === 0 ? -2 : 2) : -3;
            ctx.bezierCurveTo(x - 2, top + 18, x - 3, top + 11 + tailSwing, x + 1, top + 9 + tailSwing);
            ctx.stroke();

            // Torso
            ctx.fillStyle = themePalette.ink;
            traceRoundedRect(x + 6, top + 12, 12, 10, 4);
            ctx.fill();

            // Invertocat ears
            ctx.beginPath();
            ctx.moveTo(x + 5, top + 5);
            ctx.lineTo(x + 6, top - 1);
            ctx.lineTo(x + 11, top + 3);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x + 19, top + 5);
            ctx.lineTo(x + 18, top - 1);
            ctx.lineTo(x + 13, top + 3);
            ctx.closePath();
            ctx.fill();

            // Head dome
            traceRoundedRect(x + 4, top + 2, 16, 12, 5.5);
            ctx.fill();

            // Accent ear highlights
            ctx.fillStyle = themePalette.accent;
            ctx.fillRect(x + 6.5, top + 1.5, 1.8, 1.8);
            ctx.fillRect(x + 15.8, top + 1.5, 1.8, 1.8);

            // Face visor
            ctx.fillStyle = themePalette.visor;
            traceRoundedRect(x + 7, top + 5.5, 11, 5.5, 2.5);
            ctx.fill();

            // Glowing accent eyes
            ctx.fillStyle = themePalette.accent;
            ctx.fillRect(x + 9, top + 7.2, 2.2, 2.4);
            ctx.fillRect(x + 14, top + 7.2, 2.2, 2.4);

            // Accent collar highlight
            ctx.fillRect(x + 8, top + 13.5, 8, 1.6);

            // Legs
            ctx.fillStyle = themePalette.ink;
            if (!player.onGround) {
                // Static mid-air jump pose
                ctx.fillRect(x + 7, top + 20, 3, 4.5);
                ctx.fillRect(x + 14, top + 19, 3, 4.5);
                // Subtle accent jump sparks
                ctx.fillStyle = themePalette.accent;
                ctx.fillRect(x + 6, top + 25.5, 3, 1.5);
                ctx.fillRect(x + 14, top + 25, 3, 1.5);
            } else if (animFrame === 0) {
                ctx.fillRect(x + 7, top + 20, 3, 6);
                ctx.fillRect(x + 14, top + 20, 3, 4);
            } else {
                ctx.fillRect(x + 7, top + 20, 3, 4);
                ctx.fillRect(x + 14, top + 20, 3, 6);
            }
        }

        function drawGroundObstacle(obs) {
            const { kind, x, y, w, h } = obs;

            if (kind === 'react') {
                const cx = x + w / 2;
                const cy = y + h / 2;
                ctx.fillStyle = themePalette.surface;
                ctx.strokeStyle = themePalette.border;
                ctx.lineWidth = 1;
                traceRoundedRect(x, y, w, h, 5);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = themePalette.ink;
                ctx.lineWidth = 1.2;
                for (let a = 0; a < 3; a++) {
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.rotate((a * Math.PI) / 3);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 8.5, 3.2, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.fillStyle = themePalette.accent;
                ctx.beginPath();
                ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
                ctx.fill();
                return;
            }

            if (kind === 'ts' || kind === 'js') {
                ctx.fillStyle = themePalette.surface;
                ctx.strokeStyle = kind === 'ts' ? themePalette.ink : themePalette.border;
                ctx.lineWidth = 1.2;
                traceRoundedRect(x, y, w, h, 4);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = themePalette.accent;
                ctx.fillRect(x + 3, y + 3, kind === 'ts' ? 6 : 3, 2);

                ctx.fillStyle = themePalette.ink;
                ctx.font = '700 8.5px "Space Grotesk", monospace';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillText(kind === 'ts' ? 'TS' : 'JS', x + w - 3, y + h - 2.5);
                return;
            }

            if (kind === 'cpp') {
                const cx = x + w / 2;
                const cy = y + h / 2;
                const rx = w / 2 - 1;
                const ry = h / 2 - 1;
                ctx.fillStyle = themePalette.surface;
                ctx.strokeStyle = themePalette.ink;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(cx, cy - ry);
                ctx.lineTo(cx + rx, cy - ry * 0.45);
                ctx.lineTo(cx + rx, cy + ry * 0.45);
                ctx.lineTo(cx, cy + ry);
                ctx.lineTo(cx - rx, cy + ry * 0.45);
                ctx.lineTo(cx - rx, cy - ry * 0.45);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = themePalette.accent;
                ctx.fillRect(cx - 4, y + 3, 8, 1.5);

                ctx.fillStyle = themePalette.ink;
                ctx.font = '700 8px "Space Grotesk", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('C++', cx, cy + 1);
                return;
            }

            if (kind === 'godot') {
                // Sharp vector Godot-style robot silhouette
                ctx.fillStyle = themePalette.ink;
                traceRoundedRect(x + 2, y + 4, w - 4, h - 5, 5);
                ctx.fill();
                // Top gear notches
                ctx.fillRect(x + 4, y + 1, 4, 4);
                ctx.fillRect(x + w / 2 - 2, y, 4, 5);
                ctx.fillRect(x + w - 8, y + 1, 4, 4);
                // Eyes & visor line
                ctx.fillStyle = themePalette.visor;
                ctx.beginPath();
                ctx.arc(x + 8, y + 11, 2.2, 0, Math.PI * 2);
                ctx.arc(x + w - 8, y + 11, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = themePalette.accent;
                ctx.fillRect(x + 7.2, y + 10.2, 1.6, 1.6);
                ctx.fillRect(x + w - 8.8, y + 10.2, 1.6, 1.6);
                // Jaw line
                ctx.fillStyle = themePalette.visor;
                ctx.fillRect(x + 7, y + 17, w - 14, 1.6);
                return;
            }

            // Default: '</>' code badge
            ctx.fillStyle = themePalette.surface;
            ctx.strokeStyle = themePalette.border;
            ctx.lineWidth = 1.2;
            traceRoundedRect(x, y, w, h, 4);
            ctx.fill();
            ctx.stroke();

            ctx.font = '700 9px "Space Grotesk", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const midX = x + w / 2;
            const midY = y + h / 2 + 0.5;
            ctx.fillStyle = themePalette.ink;
            ctx.fillText('<', midX - 6, midY);
            ctx.fillStyle = themePalette.accent;
            ctx.fillText('/', midX, midY);
            ctx.fillStyle = themePalette.ink;
            ctx.fillText('>', midX + 6, midY);
        }

        function drawFlyingBug(obs) {
            const { x, y, w, h } = obs;
            const midY = y + h / 2;

            // 2-frame flapping bat/bug wings
            ctx.fillStyle = themePalette.ink;
            ctx.beginPath();
            if (animFrame === 0) {
                // Wings swept up
                ctx.moveTo(x + 8, midY);
                ctx.lineTo(x + 14, y - 3);
                ctx.lineTo(x + 19, midY - 1);
                ctx.closePath();
            } else {
                // Wings swept down
                ctx.moveTo(x + 8, midY + 1);
                ctx.lineTo(x + 14, y + h + 3);
                ctx.lineTo(x + 19, midY + 1);
                ctx.closePath();
            }
            ctx.fill();

            // Drone body
            ctx.fillStyle = themePalette.surface;
            ctx.strokeStyle = themePalette.ink;
            ctx.lineWidth = 1.2;
            traceRoundedRect(x + 3, midY - 4, w - 6, 8, 4);
            ctx.fill();
            ctx.stroke();

            // Merge-conflict antennae facing left
            ctx.strokeStyle = themePalette.accent;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x + 4, midY - 2);
            ctx.lineTo(x, midY - 5);
            ctx.moveTo(x + 4, midY + 2);
            ctx.lineTo(x, midY + 5);
            ctx.stroke();

            // Conflict eye
            ctx.fillStyle = themePalette.danger;
            ctx.fillRect(x + 6, midY - 1.5, 3, 3);
        }

        function render() {
            drawBackground();
            for (let i = 0; i < obstacles.length; i++) {
                const obs = obstacles[i];
                if (obs.type === 'flying') {
                    drawFlyingBug(obs);
                } else {
                    drawGroundObstacle(obs);
                }
            }
            drawInvertocat();
        }

        function shouldAnimate() {
            return mode !== 'gameover' && !document.hidden && isInViewport;
        }

        function tick(now) {
            if (!shouldAnimate()) {
                rafId = null;
                return;
            }
            if (!lastTime) lastTime = now;
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            update(dt);
            render();

            if (shouldAnimate()) {
                rafId = window.requestAnimationFrame(tick);
            } else {
                rafId = null;
            }
        }

        function startLoop() {
            if (rafId !== null || !shouldAnimate()) return;
            lastTime = 0;
            rafId = window.requestAnimationFrame(tick);
        }

        function stopLoop() {
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        function isEditableTarget(target) {
            if (!target) return false;
            const tag = target.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
        }

        function isStageInView() {
            const rect = stage.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight;
        }

        function startPlaying() {
            mode = 'playing';
            stage.classList.add('is-playing');
            startOverlay.hidden = true;
            if (closeBtn) closeBtn.hidden = false;
            if (duckBtn) duckBtn.hidden = false;
            if (controlsEl) controlsEl.textContent = '↑ Jump • ↓ Duck';

            syncCanvasSize();
            resetWorld(false);
            render();
            startLoop();
        }

        function enterAutopilot() {
            mode = 'autopilot';
            stage.classList.remove('is-playing');
            startOverlay.hidden = false;
            if (overlay) overlay.hidden = true;
            if (closeBtn) closeBtn.hidden = true;
            if (duckBtn) duckBtn.hidden = true;
            if (controlsEl) controlsEl.textContent = 'AUTO • ↑ Jump • ↓ Duck';

            syncCanvasSize();
            resetWorld(true);
            render();
            startLoop();
        }

        function onKeyDown(e) {
            if (isEditableTarget(e.target)) return;

            if (mode === 'autopilot') {
                if ((e.code === 'Space' || (e.target === startOverlay && e.code === 'Enter')) && isStageInView()) {
                    e.preventDefault();
                    if (!e.repeat) startPlaying();
                }
                return;
            }

            if (e.code === 'Escape') {
                e.preventDefault();
                enterAutopilot();
                return;
            }
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (mode === 'gameover') {
                    if (!e.repeat) triggerRetry();
                } else if (!e.repeat) {
                    triggerJump();
                }
                return;
            }
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                keyDuck = true;
            }
        }

        function onKeyUp(e) {
            if (e.code === 'ArrowDown') {
                keyDuck = false;
            }
        }

        function onWindowResize() {
            syncCanvasSize();
            render();
        }

        function onVisibilityChange() {
            if (document.hidden) {
                stopLoop();
            } else {
                lastTime = 0;
                startLoop();
            }
        }

        function markTouchDevice() {
            canvasWrap.classList.add('has-touch');
        }

        startOverlay.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (e.pointerType === 'touch') markTouchDevice();
            startPlaying();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                enterAutopilot();
            });
        }

        canvas.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch') markTouchDevice();
            if (mode === 'autopilot') {
                startPlaying();
            } else if (mode === 'gameover') {
                triggerRetry();
            } else {
                triggerJump();
            }
        });

        canvas.addEventListener('touchstart', (e) => {
            markTouchDevice();
            if (e.touches && e.touches.length > 0) {
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', (e) => {
            if (mode !== 'playing' || touchStartY === null || !e.touches || e.touches.length === 0) return;
            const dy = e.touches[0].clientY - touchStartY;
            if (dy > 18) {
                swipeDuckTimer = 0.6;
                touchStartY = null;
            }
        }, { passive: true });

        canvas.addEventListener('touchend', () => {
            touchStartY = null;
        }, { passive: true });

        if (overlay) {
            overlay.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                if (e.pointerType === 'touch') markTouchDevice();
                triggerRetry();
            });
        }

        if (duckBtn) {
            const releaseDuck = () => {
                touchDuck = false;
                duckBtn.classList.remove('is-active');
            };
            duckBtn.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                markTouchDevice();
                touchDuck = true;
                duckBtn.classList.add('is-active');
            });
            duckBtn.addEventListener('pointerup', releaseDuck);
            duckBtn.addEventListener('pointercancel', releaseDuck);
            duckBtn.addEventListener('pointerleave', releaseDuck);
        }

        window.addEventListener('keydown', onKeyDown, { passive: false });
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('visibilitychange', onVisibilityChange);

        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(onWindowResize);
            resizeObserver.observe(canvasWrap);
        }

        if (window.IntersectionObserver) {
            intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    isInViewport = entry.isIntersecting;
                    if (isInViewport) {
                        startLoop();
                    } else {
                        stopLoop();
                    }
                });
            }, { threshold: 0.05 });
            intersectionObserver.observe(stage);
        }

        if (window.MutationObserver) {
            const onThemeMutation = () => {
                syncThemePalette();
                render();
            };
            const themeObserver = new MutationObserver(onThemeMutation);
            themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
            themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-current-theme'] });
        }

        syncThemePalette();
        enterAutopilot();
    }

    /* --- Git Snake Mini-Game Widget (About Profile Card) --- */
    function initGitSnake() {
        const widget = document.getElementById('git-snake-widget');
        const stage = document.getElementById('git-snake-stage');
        const controlsEl = document.getElementById('git-snake-controls');
        const closeBtn = document.getElementById('git-snake-close');
        const canvasWrap = document.getElementById('git-snake-canvas-wrap');
        const canvas = document.getElementById('git-snake-canvas');
        const dpadEl = document.getElementById('git-snake-dpad');
        const scoreEl = document.getElementById('git-snake-score');
        const hiEl = document.getElementById('git-snake-hi');
        const startOverlay = document.getElementById('git-snake-start-overlay');
        const overlay = document.getElementById('git-snake-overlay');
        const finalScoreEl = document.getElementById('git-snake-final-score');

        if (!widget || !stage || !canvas || !canvasWrap || !startOverlay) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const STORAGE_KEY = 'gitSnakeHighScore';
        const CELL = 13;
        const DIRS = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };

        let mode = 'autopilot'; // 'autopilot' | 'playing' | 'gameover'
        let gameOverAt = 0;
        let rafId = null;
        let lastTime = 0;
        let stepAccumulator = 0;
        let pulsePhase = 0;
        let isInViewport = true;
        let resizeObserver = null;
        let intersectionObserver = null;

        let viewW = 340;
        let viewH = 158;
        let cols = 24;
        let rows = 11;
        let offsetX = 14;
        let offsetY = 7;

        let score = 0;
        let highScore = readHighScoreStorage(STORAGE_KEY);
        let isNewHigh = false;
        let snake = [];
        let dir = DIRS.right;
        let dirQueue = [];
        let food = { x: 16, y: 5 };
        let touchStart = null;

        let themeHelper = null;

        function getPalette() {
            return themeHelper ? themeHelper.palette : {
                bg: '#0d0d0d',
                surface: '#141414',
                border: '#262626',
                ink: '#f5f5f5',
                visor: '#0d0d0d',
                accent: '#22c55e',
                accentSoft: 'rgba(34, 197, 94, 0.35)',
                track: '#161616',
                trackDot: '#1f1f1f',
                danger: '#ef4444'
            };
        }

        function updateHudScores() {
            if (scoreEl) scoreEl.textContent = formatMiniGameScore(score);
            if (hiEl) hiEl.textContent = `HI ${formatMiniGameScore(highScore)}`;
        }

        function syncCanvasSize() {
            const w = Math.max(220, canvasWrap.clientWidth || 340);
            const h = Math.max(100, canvasWrap.clientHeight || 158);
            const dpr = Math.min(window.devicePixelRatio || 1, 3);
            const targetW = Math.round(w * dpr);
            const targetH = Math.round(h * dpr);

            if (canvas.width !== targetW || canvas.height !== targetH) {
                canvas.width = targetW;
                canvas.height = targetH;
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            viewW = w;
            viewH = h;
            const nextCols = Math.max(14, Math.floor((viewW - 8) / CELL));
            const nextRows = Math.max(8, Math.floor((viewH - 8) / CELL));
            offsetX = Math.floor((viewW - nextCols * CELL) / 2);
            offsetY = Math.floor((viewH - nextRows * CELL) / 2);

            if (nextCols !== cols || nextRows !== rows) {
                cols = nextCols;
                rows = nextRows;
                if (snake.length > 0) {
                    const outOfBounds = snake.some((s) => s.x >= cols || s.y >= rows) || food.x >= cols || food.y >= rows;
                    if (outOfBounds) resetBoard();
                }
            }
        }

        function spawnFood() {
            const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
            const free = [];
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (!occupied.has(`${x},${y}`)) free.push({ x, y });
                }
            }
            if (free.length > 0) {
                food = free[Math.floor(Math.random() * free.length)];
            }
        }

        function resetBoard() {
            isNewHigh = false;
            score = 0;
            stepAccumulator = 0;
            dir = DIRS.right;
            dirQueue = [];

            const cy = Math.floor(rows / 2);
            const cx = Math.max(4, Math.floor(cols / 3));
            snake = [
                { x: cx, y: cy },
                { x: cx - 1, y: cy },
                { x: cx - 2, y: cy }
            ];
            spawnFood();
            if (overlay) overlay.hidden = true;
            updateHudScores();
        }

        function queueDirection(nextDir) {
            if (!nextDir) return;
            const lastScheduled = dirQueue.length > 0 ? dirQueue[dirQueue.length - 1] : dir;
            if (nextDir.x + lastScheduled.x === 0 && nextDir.y + lastScheduled.y === 0) return;
            if (nextDir.x === lastScheduled.x && nextDir.y === lastScheduled.y) return;
            if (dirQueue.length < 2) {
                dirQueue.push(nextDir);
            }
        }

        function countReachable(startX, startY, blockedSet) {
            const visited = new Set([`${startX},${startY}`]);
            const queue = [{ x: startX, y: startY }];
            let idx = 0;
            while (idx < queue.length && visited.size < snake.length + 12) {
                const cur = queue[idx++];
                const neighbors = [DIRS.up, DIRS.down, DIRS.left, DIRS.right];
                for (let i = 0; i < neighbors.length; i++) {
                    const nx = cur.x + neighbors[i].x;
                    const ny = cur.y + neighbors[i].y;
                    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                    const key = `${nx},${ny}`;
                    if (blockedSet.has(key) || visited.has(key)) continue;
                    visited.add(key);
                    queue.push({ x: nx, y: ny });
                }
            }
            return visited.size;
        }

        function pickAutopilotDir() {
            const head = snake[0];
            const tail = snake[snake.length - 1];
            const bodyBlocked = new Set();
            for (let i = 0; i < snake.length - 1; i++) {
                bodyBlocked.add(`${snake[i].x},${snake[i].y}`);
            }

            const candidates = [DIRS.up, DIRS.down, DIRS.left, DIRS.right].filter((d) => {
                if (d.x + dir.x === 0 && d.y + dir.y === 0) return false;
                const nx = head.x + d.x;
                const ny = head.y + d.y;
                if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return false;
                return !bodyBlocked.has(`${nx},${ny}`);
            });

            if (candidates.length === 0) return null;

            // BFS shortest path to food
            const queue = [];
            const visited = new Set([`${head.x},${head.y}`]);
            for (let i = 0; i < candidates.length; i++) {
                const d = candidates[i];
                const nx = head.x + d.x;
                const ny = head.y + d.y;
                const key = `${nx},${ny}`;
                visited.add(key);
                queue.push({ x: nx, y: ny, firstDir: d });
            }

            let bfsDir = null;
            let qi = 0;
            while (qi < queue.length) {
                const cur = queue[qi++];
                if (cur.x === food.x && cur.y === food.y) {
                    bfsDir = cur.firstDir;
                    break;
                }
                const steps = [DIRS.up, DIRS.down, DIRS.left, DIRS.right];
                for (let i = 0; i < steps.length; i++) {
                    const nx = cur.x + steps[i].x;
                    const ny = cur.y + steps[i].y;
                    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                    const key = `${nx},${ny}`;
                    if (bodyBlocked.has(key) || visited.has(key)) continue;
                    visited.add(key);
                    queue.push({ x: nx, y: ny, firstDir: cur.firstDir });
                }
            }

            if (bfsDir) {
                const nx = head.x + bfsDir.x;
                const ny = head.y + bfsDir.y;
                const nextBlocked = new Set(bodyBlocked);
                nextBlocked.add(`${head.x},${head.y}`);
                if (nx !== tail.x || ny !== tail.y) {
                    const space = countReachable(nx, ny, nextBlocked);
                    if (space >= Math.min(snake.length, 10)) {
                        return bfsDir;
                    }
                }
            }

            // Fallback: pick safe direction with largest open space & nearest to food
            let bestDir = candidates[0];
            let bestScore = -Infinity;
            for (let i = 0; i < candidates.length; i++) {
                const d = candidates[i];
                const nx = head.x + d.x;
                const ny = head.y + d.y;
                const space = countReachable(nx, ny, bodyBlocked);
                const dist = Math.abs(nx - food.x) + Math.abs(ny - food.y);
                const heuristic = space * 10 - dist;
                if (heuristic > bestScore) {
                    bestScore = heuristic;
                    bestDir = d;
                }
            }
            return bestDir;
        }

        function handleGameOver() {
            mode = 'gameover';
            gameOverAt = performance.now();
            stopLoop();

            if (score > highScore) {
                highScore = score;
                isNewHigh = true;
                writeHighScoreStorage(STORAGE_KEY, highScore);
            }
            updateHudScores();

            if (finalScoreEl) {
                finalScoreEl.textContent = isNewHigh
                    ? `NEW HI // SCORE ${formatMiniGameScore(score)}`
                    : `SCORE ${formatMiniGameScore(score)}`;
            }
            if (overlay) overlay.hidden = false;
        }

        function stepGame() {
            if (mode === 'autopilot') {
                const autoDir = pickAutopilotDir();
                if (!autoDir) {
                    resetBoard();
                    return;
                }
                dir = autoDir;
            } else if (dirQueue.length > 0) {
                dir = dirQueue.shift();
            }

            const head = snake[0];
            const next = { x: head.x + dir.x, y: head.y + dir.y };
            const ateFood = next.x === food.x && next.y === food.y;

            const hitWall = next.x < 0 || next.x >= cols || next.y < 0 || next.y >= rows;
            const checkLimit = ateFood ? snake.length : snake.length - 1;
            let hitSelf = false;
            for (let i = 0; i < checkLimit; i++) {
                if (snake[i].x === next.x && snake[i].y === next.y) {
                    hitSelf = true;
                    break;
                }
            }

            if (hitWall || hitSelf) {
                if (mode === 'autopilot') {
                    resetBoard();
                } else {
                    handleGameOver();
                }
                return;
            }

            snake.unshift(next);
            if (ateFood) {
                if (mode === 'playing') {
                    score += 10;
                    if (score > highScore) {
                        highScore = score;
                        isNewHigh = true;
                    }
                    updateHudScores();
                } else if (snake.length > Math.floor((cols * rows) * 0.35)) {
                    resetBoard();
                    return;
                }
                spawnFood();
            } else {
                snake.pop();
            }
        }

        function render() {
            const p = getPalette();
            ctx.fillStyle = p.bg;
            ctx.fillRect(0, 0, viewW, viewH);

            // Subtle board border & grid dots
            ctx.strokeStyle = p.track;
            ctx.lineWidth = 1;
            ctx.strokeRect(offsetX + 0.5, offsetY + 0.5, cols * CELL - 1, rows * CELL - 1);

            ctx.fillStyle = p.trackDot;
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const cx = offsetX + x * CELL + CELL * 0.5;
                    const cy = offsetY + y * CELL + CELL * 0.5;
                    ctx.fillRect(cx - 0.75, cy - 0.75, 1.5, 1.5);
                }
            }

            // Food (pulsing git commit target)
            const fx = offsetX + food.x * CELL + CELL * 0.5;
            const fy = offsetY + food.y * CELL + CELL * 0.5;
            const pulse = 0.85 + Math.sin(pulsePhase) * 0.15;
            const foodR = (CELL * 0.33) * pulse;

            ctx.fillStyle = p.accentSoft;
            ctx.beginPath();
            ctx.arc(fx, fy, foodR + 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = p.danger;
            ctx.beginPath();
            ctx.arc(fx, fy, foodR, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = p.ink;
            ctx.beginPath();
            ctx.arc(fx - foodR * 0.25, fy - foodR * 0.25, Math.max(1, foodR * 0.28), 0, Math.PI * 2);
            ctx.fill();

            // Snake body & head
            for (let i = snake.length - 1; i >= 0; i--) {
                const seg = snake[i];
                const isHead = i === 0;
                const isTail = i === snake.length - 1;
                const pad = isHead ? 1 : (isTail ? 2.5 : 1.5);
                const sx = offsetX + seg.x * CELL + pad;
                const sy = offsetY + seg.y * CELL + pad;
                const size = CELL - pad * 2;

                ctx.fillStyle = isHead ? p.accent : p.ink;
                if (!isHead && i % 2 === 1) {
                    ctx.globalAlpha = 0.85;
                }
                traceRoundedRectPath(ctx, sx, sy, size, size, isHead ? 3.5 : 2.5);
                ctx.fill();
                ctx.globalAlpha = 1;

                if (isHead) {
                    // Directional eyes
                    ctx.fillStyle = p.visor;
                    const ex1 = dir.x === 1 ? sx + size - 3.5 : (dir.x === -1 ? sx + 1.8 : sx + 2);
                    const ey1 = dir.y === 1 ? sy + size - 3.5 : (dir.y === -1 ? sy + 1.8 : sy + 2);
                    const ex2 = dir.x === 0 ? sx + size - 3.8 : ex1;
                    const ey2 = dir.y === 0 ? sy + size - 3.8 : ey1;
                    ctx.fillRect(ex1, ey1, 2, 2);
                    ctx.fillRect(ex2, ey2, 2, 2);
                }
            }
        }

        function shouldAnimate() {
            return mode !== 'gameover' && !document.hidden && isInViewport;
        }

        function tick(now) {
            if (!shouldAnimate()) {
                rafId = null;
                return;
            }
            if (!lastTime) lastTime = now;
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            pulsePhase += dt * 5;
            const stepInterval = mode === 'autopilot'
                ? 0.11
                : Math.max(0.072, 0.128 - (score / 10) * 0.0022);

            stepAccumulator += dt;
            if (stepAccumulator >= stepInterval) {
                stepAccumulator -= stepInterval;
                stepGame();
            }

            render();

            if (shouldAnimate()) {
                rafId = window.requestAnimationFrame(tick);
            } else {
                rafId = null;
            }
        }

        function startLoop() {
            if (rafId !== null || !shouldAnimate()) return;
            lastTime = 0;
            rafId = window.requestAnimationFrame(tick);
        }

        function stopLoop() {
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        function isEditableTarget(target) {
            if (!target) return false;
            const tag = target.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
        }

        function isStageInView() {
            const rect = stage.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight;
        }

        function startPlaying() {
            mode = 'playing';
            stage.classList.add('is-playing');
            startOverlay.hidden = true;
            if (closeBtn) closeBtn.hidden = false;
            if (dpadEl) dpadEl.hidden = false;
            if (controlsEl) controlsEl.textContent = 'Arrows / WASD • Swipe';

            syncCanvasSize();
            resetBoard();
            render();
            startLoop();
        }

        function enterAutopilot() {
            mode = 'autopilot';
            stage.classList.remove('is-playing');
            startOverlay.hidden = false;
            if (overlay) overlay.hidden = true;
            if (closeBtn) closeBtn.hidden = true;
            if (dpadEl) dpadEl.hidden = true;
            if (controlsEl) controlsEl.textContent = 'AUTO • Arrows / Swipe';

            syncCanvasSize();
            resetBoard();
            render();
            startLoop();
        }

        function triggerRetry() {
            if (mode !== 'gameover') return;
            if (performance.now() - gameOverAt < 180) return;
            startPlaying();
        }

        function markTouchDevice() {
            canvasWrap.classList.add('has-touch');
        }

        function onKeyDown(e) {
            if (isEditableTarget(e.target)) return;

            if (mode === 'autopilot') {
                if ((e.code === 'Space' || (e.target === startOverlay && e.code === 'Enter')) && isStageInView()) {
                    e.preventDefault();
                    if (!e.repeat) startPlaying();
                }
                return;
            }

            if (e.code === 'Escape') {
                e.preventDefault();
                enterAutopilot();
                return;
            }

            if (mode === 'gameover') {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    if (!e.repeat) triggerRetry();
                }
                return;
            }

            const keyToDir = {
                ArrowUp: DIRS.up,
                KeyW: DIRS.up,
                ArrowDown: DIRS.down,
                KeyS: DIRS.down,
                ArrowLeft: DIRS.left,
                KeyA: DIRS.left,
                ArrowRight: DIRS.right,
                KeyD: DIRS.right
            };
            const mapped = keyToDir[e.code];
            if (mapped) {
                e.preventDefault();
                queueDirection(mapped);
            } else if (e.code === 'Space') {
                e.preventDefault();
            }
        }

        startOverlay.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (e.pointerType === 'touch') markTouchDevice();
            startPlaying();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                enterAutopilot();
            });
        }

        if (overlay) {
            overlay.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                if (e.pointerType === 'touch') markTouchDevice();
                triggerRetry();
            });
        }

        if (dpadEl) {
            dpadEl.addEventListener('pointerdown', (e) => {
                const btn = e.target.closest('.git-snake-dpad-btn');
                if (!btn) return;
                e.stopPropagation();
                e.preventDefault();
                markTouchDevice();
                if (mode === 'playing') {
                    queueDirection(DIRS[btn.dataset.dir]);
                }
            });
        }

        canvas.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch') markTouchDevice();
            if (mode === 'autopilot') {
                startPlaying();
            } else if (mode === 'gameover') {
                triggerRetry();
            }
        });

        canvas.addEventListener('touchstart', (e) => {
            markTouchDevice();
            if (e.touches && e.touches.length > 0) {
                touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', (e) => {
            if (mode !== 'playing' || !touchStart || !e.touches || e.touches.length === 0) return;
            const dx = e.touches[0].clientX - touchStart.x;
            const dy = e.touches[0].clientY - touchStart.y;
            if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;

            if (Math.abs(dx) > Math.abs(dy)) {
                queueDirection(dx > 0 ? DIRS.right : DIRS.left);
            } else {
                queueDirection(dy > 0 ? DIRS.down : DIRS.up);
            }
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }, { passive: true });

        canvas.addEventListener('touchend', () => {
            touchStart = null;
        }, { passive: true });

        const onWindowResize = () => {
            syncCanvasSize();
            render();
        };

        const onVisibilityChange = () => {
            if (document.hidden) {
                stopLoop();
            } else {
                lastTime = 0;
                startLoop();
            }
        };

        window.addEventListener('keydown', onKeyDown, { passive: false });
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('visibilitychange', onVisibilityChange);

        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(onWindowResize);
            resizeObserver.observe(canvasWrap);
        }

        if (window.IntersectionObserver) {
            intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    isInViewport = entry.isIntersecting;
                    if (isInViewport) {
                        startLoop();
                    } else {
                        stopLoop();
                    }
                });
            }, { threshold: 0.05 });
            intersectionObserver.observe(stage);
        }

        themeHelper = createStageThemeHelper(stage, render);
        enterAutopilot();
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
        initIntroFromJson();
        initGitRunner();
        initGitSnake();
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
