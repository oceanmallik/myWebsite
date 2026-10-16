(function () {
    const THEME_CLASSES = ['theme-cyberpunk', 'theme-white', 'theme-soft', 'theme-aurora', 'theme-black'];
    const THEME_ICONS = ['fa-bolt', 'fa-sun', 'fa-cloud', 'fa-water', 'fa-moon'];
    const THEME_LABELS = ['Cyberpunk', 'White', 'Soft', 'Aurora', 'Black'];

    function getStoredThemeIndex() {
        let storedIndex = parseInt(localStorage.getItem('themeIndex'), 10);

        if (Number.isNaN(storedIndex) || storedIndex < 0 || storedIndex >= THEME_CLASSES.length) {
            storedIndex = 4;
        }

        return storedIndex;
    }

    function applyBodyTheme(body, index) {
        body.classList.remove(...THEME_CLASSES);

        if (THEME_CLASSES[index]) {
            body.classList.add(THEME_CLASSES[index]);
        }
    }

    function initMobileMenu() {
        const menuButton = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!menuButton || !mobileMenu) {
            return;
        }

        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

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
            if (!themeList) {
                return;
            }

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
            if (!themeList || !themeListToggleButton) {
                return;
            }

            themeList.classList.add('hidden');
            themeListToggleButton.classList.remove('open');
            themeListToggleButton.setAttribute('aria-expanded', 'false');
        }

        function toggleThemeList() {
            if (!themeList || !themeListToggleButton) {
                return;
            }

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
                    return;
                }
            };

            if (!shouldFade) {
                updateTheme();
                return;
            }

            body.classList.add('theme-fading');
            requestAnimationFrame(() => {
                updateTheme();
                setTimeout(() => body.classList.remove('theme-fading'), 300);
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

    function initAccordions() {
        const accordionButtons = document.getElementsByClassName('accordion-btn');

        for (let index = 0; index < accordionButtons.length; index += 1) {
            accordionButtons[index].addEventListener('click', function () {
                this.classList.toggle('active');

                const panel = this.nextElementSibling;
                if (!panel) {
                    return;
                }

                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = `${panel.scrollHeight}px`;
                }
            });
        }
    }

    function initDynamicYear() {
        const yearElement = document.getElementById('current-year');

        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

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
            event.stopPropagation(); // Prevent document click from immediately closing it
            const isShown = modal.classList.contains('show');
            if (!isShown) {
                modal.classList.add('show');
                modal.querySelector('.donation-qr-close').focus();
            } else {
                closeModal();
            }
        });
        modal.querySelector('.donation-qr-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent clicks inside modal from reaching document
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

    function initTypingEffect() {
        const typingElement = document.getElementById('typing-text');

        if (!typingElement) {
            return;
        }

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

    function initHeroPointerLight() {
        const heroButtons = document.querySelectorAll('.hero-buttons .btn');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!heroButtons.length || prefersReducedMotion) {
            return;
        }

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

    function initActivitiesFromJson() {
        const activitiesGrid = document.getElementById('activities-grid');
        const activitiesPreviewGrid = document.getElementById('activities-preview-grid');

        if (!activitiesGrid && !activitiesPreviewGrid) {
            return;
        }

        const statusMap = {
            active: { className: 'status-active', label: 'Actively Working' },
            finished: { className: 'status-finished', label: 'Finished' },
            idle: { className: 'status-idle', label: 'Not Sure' }
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

            if (activity.featured) {
                const highlightElement = document.createElement('div');
                highlightElement.className = 'card-highlight';
                highlightElement.textContent = 'Featured';
                cardElement.appendChild(highlightElement);
            }

            const cardImageElement = document.createElement('div');
            cardImageElement.className = 'card-image';

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
            if (!targetGrid) {
                return;
            }

            targetGrid.innerHTML = '';

            const infoCardElement = document.createElement('div');
            infoCardElement.className = 'card project-card';

            const contentElement = document.createElement('div');
            contentElement.className = 'card-content';

            const titleElement = document.createElement('h3');
            titleElement.textContent = 'Activities';

            const textElement = document.createElement('p');
            textElement.textContent = message;

            contentElement.appendChild(titleElement);
            contentElement.appendChild(textElement);
            infoCardElement.appendChild(contentElement);

            targetGrid.appendChild(infoCardElement);
        };

        const renderActivitiesIntoGrid = (targetGrid, activities, limit = null) => {
            if (!targetGrid) {
                return;
            }

            targetGrid.innerHTML = '';

            const itemsToRender = limit === null ? activities : activities.slice(0, limit);
            itemsToRender.forEach((activity) => {
                targetGrid.appendChild(createCardElement(activity));
            });
        };

        fetch('../myWorks.json')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load myWorks.json (${response.status})`);
                }

                return response.json();
            })
            .then((data) => {
                const activities = Array.isArray(data) ? data : data.works;

                if (!Array.isArray(activities) || activities.length === 0) {
                    showInfoMessage(activitiesGrid, 'No activities found in myWorks.json yet.');
                    showInfoMessage(activitiesPreviewGrid, 'No activities found in myWorks.json yet.');
                    return;
                }

                renderActivitiesIntoGrid(activitiesGrid, activities);
                renderActivitiesIntoGrid(activitiesPreviewGrid, activities, 3);
            })
            .catch(() => {
                showInfoMessage(activitiesGrid, 'Could not load activities right now. Please check myWorks.json.');
                showInfoMessage(activitiesPreviewGrid, 'Could not load activities right now. Please check myWorks.json.');
            });
    }

    function initCertificatesFromJson() {
        const accordionContainer = document.getElementById('certificates-accordion');

        if (!accordionContainer) {
            return;
        }

        const sourcePath = accordionContainer.dataset.certificatesSource || '../../myCertificates.json';
        const imageBasePath = accordionContainer.dataset.certificatesImageBase || '';
        const limitValue = parseInt(accordionContainer.dataset.certificatesLimit, 10);
        const certificatesLimit = Number.isNaN(limitValue) ? null : Math.max(0, limitValue);
        const featuredOnly = accordionContainer.dataset.certificatesFeaturedOnly === 'true';

        const renderInfoCard = (message) => {
            accordionContainer.innerHTML = '';

            const infoCardElement = document.createElement('div');
            infoCardElement.className = 'card';

            const titleElement = document.createElement('h3');
            titleElement.textContent = 'Certificates';

            const messageElement = document.createElement('p');
            messageElement.textContent = message;

            infoCardElement.appendChild(titleElement);
            infoCardElement.appendChild(messageElement);
            accordionContainer.appendChild(infoCardElement);
        };

        fetch(sourcePath)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load myCertificates.json (${response.status})`);
                }

                return response.json();
            })
            .then((data) => {
                const certificates = Array.isArray(data) ? data : data.certificates;
                const featuredCertificates = featuredOnly ? certificates.filter((certificate) => certificate && certificate.featured) : certificates;
                const certificatesToRender = certificatesLimit === null ? featuredCertificates : featuredCertificates.slice(0, certificatesLimit);

                if (!Array.isArray(certificates) || certificatesToRender.length === 0) {
                    renderInfoCard(featuredOnly ? 'No featured certificates found in myCertificates.json yet.' : 'No certificates found in myCertificates.json yet.');
                    return;
                }

                accordionContainer.innerHTML = '';

                certificatesToRender.forEach((certificate) => {
                    const certificateItemElement = document.createElement('div');
                    certificateItemElement.className = 'certificate-item';

                    if (certificate.featured) {
                        certificateItemElement.classList.add('featured-card');
                    }

                    const imageCardElement = document.createElement('div');
                    imageCardElement.className = 'certificate-image-card';

                    const imageLinkElement = document.createElement('a');
                    imageLinkElement.href = certificate.verifyUrl || '#';
                    imageLinkElement.target = '_blank';
                    imageLinkElement.rel = 'noopener noreferrer';
                    imageLinkElement.title = certificate.verifyTitle || 'Click to Verify Certificate';

                    const imageElement = document.createElement('img');
                    imageElement.src = certificate.image ? `${imageBasePath}${certificate.image}` : '';
                    imageElement.alt = certificate.alt || `${certificate.title || 'Certificate'} image`;
                    imageElement.className = 'cert-img';
                    imageElement.style.cursor = 'pointer';

                    imageLinkElement.appendChild(imageElement);

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

                    imageCardElement.appendChild(imageLinkElement);
                    certificateItemElement.appendChild(imageCardElement);
                    certificateItemElement.appendChild(cardContentElement);
                    accordionContainer.appendChild(certificateItemElement);
                });
            })
            .catch(() => {
                renderInfoCard('Could not load certificates right now. Please check myCertificates.json.');
            });
    }

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
                rootMargin: '0px 0px -50px 0px'
            });

            reveals.forEach((reveal) => {
                revealObserver.observe(reveal);
            });
        } else {
            // Fallback for older browsers
            reveals.forEach(reveal => reveal.classList.add('active'));
        }
    }

    function initSite() {
        initDynamicYear();
        initDonationQr();
        initMobileMenu();
        initThemeSwitcher();
        initAccordions();
        initTypingEffect();
        initHeroPointerLight();
        initActivitiesFromJson();
        initCertificatesFromJson();
        initScrollReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSite);
    } else {
        initSite();
    }
})();