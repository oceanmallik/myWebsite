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

    /* --- BanglaQR Donation Modal --- */
    function initDonationQr() {
        const qrButton = document.createElement('button');
        qrButton.type = 'button';
        qrButton.className = 'donation-qr-button';
        qrButton.setAttribute('aria-label', 'Show BanglaQR donation code');
        qrButton.setAttribute('title', 'Donate via BanglaQR');
        qrButton.innerHTML = '<i class="fas fa-qrcode" aria-hidden="true"></i>';

        const modal = document.createElement('div');
        modal.className = 'donation-qr-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'donation-qr-title');
        modal.innerHTML = `
            <div class="donation-qr-panel">
                <button type="button" class="donation-qr-close" aria-label="Close BanglaQR donation window" title="Close">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
                <h2 id="donation-qr-title">Donate via BanglaQR</h2>
                <img src="banglaQR.jpg" alt="BanglaQR donation code">
            </div>
        `;

        const closeModal = () => {
            modal.classList.remove('show');
            qrButton.focus();
        };

        qrButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isShown = modal.classList.contains('show');
            if (!isShown) {
                modal.classList.add('show');
                const closeBtn = modal.querySelector('.donation-qr-close');
                if (closeBtn) closeBtn.focus();
            } else {
                closeModal();
            }
        });

        const closeBtn = modal.querySelector('.donation-qr-close');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        document.addEventListener('click', (event) => {
            if (modal.classList.contains('show') && event.target !== qrButton) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });

        document.body.append(qrButton, modal);
    }

    /* --- Typing Effect in Hero --- */
    function initTypingEffect() {
        const typingElement = document.getElementById('typing-text');
        if (!typingElement) return;

        const fullText = 'Software Engineer in training - currently powered by curiosity and caffeine.';
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

        const createLinkElement = (link) => {
            const anchorElement = document.createElement('a');
            const iconElement = document.createElement('i');
            const iconClass = link.iconClass || (link.type === 'github' ? 'fab fa-github' : 'fas fa-external-link-alt');

            anchorElement.href = link.url || '#';
            anchorElement.target = '_blank';
            anchorElement.rel = 'noopener noreferrer';

            if (link.type === 'live') {
                anchorElement.classList.add('live-link');
            }

            iconElement.className = iconClass;
            anchorElement.appendChild(iconElement);
            anchorElement.appendChild(document.createTextNode(` ${link.label || 'Open'}`));

            return anchorElement;
        };

        const createCardElement = (activity) => {
            const statusConfig = typeof activity.status === 'string' ? statusMap[activity.status] : null;
            const statusClassName = activity.statusClass || (statusConfig ? statusConfig.className : statusMap.active.className);
            const statusLabel = activity.statusLabel || (statusConfig ? statusConfig.label : statusMap.active.label);

            const cardElement = document.createElement('div');
            cardElement.className = `card project-card${activity.featured ? ' featured-card' : ''}`;

            // Mini macOS window header bar
            const windowHeader = document.createElement('div');
            windowHeader.className = 'card-window-header';
            windowHeader.innerHTML = `
                <span class="window-dot dot-red"></span>
                <span class="window-dot dot-yellow"></span>
                <span class="window-dot dot-green"></span>
                <span class="window-title">${activity.category || activity.tech?.[0] || 'App'}</span>
            `;
            cardElement.appendChild(windowHeader);

            const cardImageElement = document.createElement('div');
            cardImageElement.className = 'card-image';

            if (activity.featured) {
                const highlightElement = document.createElement('div');
                highlightElement.className = 'card-highlight';
                highlightElement.innerHTML = '<i class="fas fa-star" style="font-size: 0.62rem; margin-right: 4px;"></i> Featured';
                cardImageElement.appendChild(highlightElement);
            }

            const cardIconElement = document.createElement('i');
            cardIconElement.className = activity.icon || 'fas fa-code';
            cardImageElement.appendChild(cardIconElement);

            const cardContentElement = document.createElement('div');
            cardContentElement.className = 'card-content';

            const statusElement = document.createElement('div');
            statusElement.className = `project-status ${statusClassName}`;

            const statusLightElement = document.createElement('span');
            statusLightElement.className = 'status-light';
            statusLightElement.setAttribute('aria-hidden', 'true');

            const statusTextElement = document.createElement('span');
            statusTextElement.textContent = statusLabel;

            statusElement.appendChild(statusLightElement);
            statusElement.appendChild(statusTextElement);

            const titleElement = document.createElement('h3');
            const titleLinkElement = document.createElement('a');
            titleLinkElement.href = activity.primaryUrl || '#';
            titleLinkElement.target = '_blank';
            titleLinkElement.rel = 'noopener noreferrer';
            titleLinkElement.textContent = activity.title || 'Untitled Activity';
            titleElement.appendChild(titleLinkElement);

            const descriptionElement = document.createElement('p');
            descriptionElement.textContent = activity.description || '';

            const badgesElement = document.createElement('div');
            badgesElement.className = 'tech-badges';

            (Array.isArray(activity.tech) ? activity.tech : []).forEach((techItem) => {
                const badgeElement = document.createElement('small');
                badgeElement.textContent = techItem;
                badgesElement.appendChild(badgeElement);
            });

            const linksElement = document.createElement('div');
            linksElement.className = 'card-links';

            (Array.isArray(activity.links) ? activity.links : []).forEach((link) => {
                if (link && link.url) {
                    linksElement.appendChild(createLinkElement(link));
                }
            });

            cardContentElement.appendChild(statusElement);
            cardContentElement.appendChild(titleElement);
            cardContentElement.appendChild(descriptionElement);
            cardContentElement.appendChild(badgesElement);
            cardContentElement.appendChild(linksElement);

            cardElement.appendChild(cardImageElement);
            cardElement.appendChild(cardContentElement);

            return cardElement;
        };

        const showInfoMessage = (targetGrid, message) => {
            if (!targetGrid) return;
            targetGrid.innerHTML = `
                <div class="card project-card" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                    <i class="fas fa-search" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px; display: block;"></i>
                    <h3 style="margin-bottom: 8px;">No matching activities found</h3>
                    <p style="color: var(--text-muted);">${message}</p>
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

        fetchJsonWithFallback(['myWorks.json', './myWorks.json', '../myWorks.json'])
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

        const imageBasePath = accordionContainer.dataset.certificatesImageBase || 'pages/achievements/';
        const limitValue = parseInt(accordionContainer.dataset.certificatesLimit, 10);
        const certificatesLimit = Number.isNaN(limitValue) ? null : Math.max(0, limitValue);
        const featuredOnly = accordionContainer.dataset.certificatesFeaturedOnly === 'true';

        initCertificateLightbox();

        const renderInfoCard = (message) => {
            accordionContainer.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                    <i class="fas fa-certificate" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px; display: block;"></i>
                    <h3 style="margin-bottom: 8px;">Certificates</h3>
                    <p style="color: var(--text-muted);">${message}</p>
                </div>
            `;
        };

        const renderCertificates = (certificates) => {
            accordionContainer.innerHTML = '';

            certificates.forEach((certificate) => {
                const certificateItemElement = document.createElement('div');
                certificateItemElement.className = 'certificate-item';

                if (certificate.featured) {
                    certificateItemElement.classList.add('featured-card');
                }

                const imageCardElement = document.createElement('div');
                imageCardElement.className = 'certificate-image-card';

                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'certificate-image-wrapper';
                imageWrapper.setAttribute('role', 'button');
                imageWrapper.setAttribute('tabindex', '0');
                imageWrapper.setAttribute('title', 'Click to view full certificate');

                const imageElement = document.createElement('img');
                imageElement.src = certificate.image ? `${imageBasePath}${certificate.image}` : '';
                imageElement.alt = certificate.alt || `${certificate.title || 'Certificate'} image`;
                imageElement.className = 'cert-img';

                const zoomOverlay = document.createElement('div');
                zoomOverlay.className = 'cert-zoom-overlay';
                zoomOverlay.innerHTML = '<span class="cert-zoom-pill"><i class="fas fa-search-plus"></i> View Fullscreen</span>';

                imageWrapper.appendChild(imageElement);
                imageWrapper.appendChild(zoomOverlay);

                // Clicking thumbnail opens Lightbox
                const triggerLightbox = (event) => {
                    event.preventDefault();
                    openCertificateLightbox(certificate, imageBasePath);
                };

                imageWrapper.addEventListener('click', triggerLightbox);
                imageWrapper.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        triggerLightbox(event);
                    }
                });

                const cardContentElement = document.createElement('div');
                cardContentElement.className = 'certificate-card-content';

                const headerElement = document.createElement('div');
                headerElement.className = 'certificate-header-row';

                const titleElement = document.createElement('h3');
                titleElement.className = 'certificate-title';
                titleElement.textContent = certificate.title || 'Untitled Certificate';
                headerElement.appendChild(titleElement);

                if (certificate.featured) {
                    const highlightElement = document.createElement('div');
                    highlightElement.className = 'card-highlight';
                    const highlightTextElement = document.createElement('span');
                    highlightTextElement.className = 'card-highlight-text';
                    highlightTextElement.textContent = 'Featured';
                    highlightElement.appendChild(highlightTextElement);
                    imageCardElement.appendChild(highlightElement);
                }

                cardContentElement.appendChild(headerElement);

                imageCardElement.appendChild(imageWrapper);
                certificateItemElement.appendChild(imageCardElement);
                certificateItemElement.appendChild(cardContentElement);
                accordionContainer.appendChild(certificateItemElement);
            });
        };

        fetchJsonWithFallback(['myCertificates.json', './myCertificates.json', '../../myCertificates.json'])
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

                // If on achievements.html, support category filter pills
                const filterButtons = document.querySelectorAll('#cert-filter-group .filter-pill');
                if (filterButtons.length > 0) {
                    let activeCategory = 'all';

                    const applyCertFilter = () => {
                        const filtered = allCertificates.filter((cert) => {
                            if (activeCategory === 'all') return true;
                            return cert.category === activeCategory;
                        });
                        renderCertificates(filtered);
                    };

                    filterButtons.forEach((btn) => {
                        btn.addEventListener('click', () => {
                            filterButtons.forEach((b) => b.classList.remove('active'));
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

        const sourcePath = container.dataset.skillsSource || 'mySkills.json';

        fetchJsonWithFallback([sourcePath, './mySkills.json', '../mySkills.json', 'mySkills.json'])
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

        const sourcePath = container.dataset.educationSource || 'myEducation.json';

        fetchJsonWithFallback([sourcePath, './myEducation.json', '../myEducation.json', 'myEducation.json'])
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
        initDonationQr();
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
