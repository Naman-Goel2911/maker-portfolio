/* Space portfolio interactions: cosmic background, nav, sections */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* Enhanced Cosmic Background - Only on Landing Section - 50% More Stars */
(() => {
    const canvas = $('#cosmos');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let cosmicObjects = [];
    let time = 0;
    let isAnimating = false;

    // Trail tuning
    const TRAIL_FADE_ALPHA = 0.35; // higher = faster fade
    const STAR_TRAIL_OPACITY = 0.22; // lower = subtler trail
    const STAR_TRAIL_WIDTH = 0.18; // thin line width
    const HARD_CLEAR_EVERY = 90; // frames
    let __frameCounter = 0;

    // Motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    class Star {
        constructor() {
            this.reset();
            this.type = 'star';
        }

        reset() {
            this.x = (Math.random() - 0.5) * 2000;
            this.y = (Math.random() - 0.5) * 2000;
            this.z = Math.random() * 1000 + 1;
            this.prevX = this.x / this.z;
            this.prevY = this.y / this.z;
            this.size = Math.random() * 2 + 0.5;
            this.brightness = Math.random() * 0.8 + 0.2;
        }

        update(speed) {
            this.prevX = this.x / this.z;
            this.prevY = this.y / this.z;
            this.z -= speed;

            if (this.z <= 0) {
                this.reset();
            }
        }

        draw(ctx, width, height, trails = false) {
            const x = (this.x / this.z) * width + width / 2;
            const y = (this.y / this.z) * height + height / 2;
            const size = (1 - this.z / 1000) * this.size;

            if (x < 0 || x > width || y < 0 || y > height) return;

            const alpha = this.brightness * (1 - this.z / 1000);
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.8})`;

            // Draw trail if enabled
            if (trails && !prefersReducedMotion.matches) {
                const prevX = (this.prevX) * width + width / 2;
                const prevY = (this.prevY) * height + height / 2;
                const distance = Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);

                if (distance > 1) {
                    ctx.save();
                    ctx.globalAlpha = STAR_TRAIL_OPACITY * alpha;
                    ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.6})`;
                    ctx.lineWidth = size * STAR_TRAIL_WIDTH;
                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    ctx.restore();
                }
            }

            // Main star
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Glow effect
            if (size > 1) {
                ctx.save();
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.1})`;
                ctx.beginPath();
                ctx.arc(x, y, size * 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }

    class Nebula {
        constructor() {
            this.x = Math.random() * 2000 - 1000;
            this.y = Math.random() * 2000 - 1000;
            this.z = Math.random() * 800 + 200;
            this.size = Math.random() * 100 + 50;
            this.hue = Math.random() * 60 + 270; // Purple to blue range
            this.type = 'nebula';
        }

        update(speed) {
            this.z -= speed * 0.3;
            if (this.z <= 0) {
                this.x = Math.random() * 2000 - 1000;
                this.y = Math.random() * 2000 - 1000;
                this.z = Math.random() * 800 + 200;
            }
        }

        draw(ctx, width, height) {
            const x = (this.x / this.z) * width + width / 2;
            const y = (this.y / this.z) * height + height / 2;
            const size = (1 - this.z / 1000) * this.size;
            const alpha = 0.05 * (1 - this.z / 1000);

            if (x < -size || x > width + size || y < -size || y > height + size) return;

            ctx.save();
            ctx.globalAlpha = alpha;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, 0.1)`);
            gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function initCosmos() {
        cosmicObjects = [];

        // 50% more stars than before (was 150, now 225)
        for (let i = 0; i < 225; i++) {
            cosmicObjects.push(new Star());
        }

        // Add nebulae
        for (let i = 0; i < 8; i++) {
            cosmicObjects.push(new Nebula());
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function animate() {
        if (!isAnimating) return;

        const speed = prefersReducedMotion.matches ? 1 : 3;
        time += 0.005;
        __frameCounter++;

        // Determine if we should clear the canvas completely
        const shouldHardClear = (__frameCounter % HARD_CLEAR_EVERY) === 0;

        if (shouldHardClear || prefersReducedMotion.matches) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            // Soft fade for trails
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_FADE_ALPHA})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        // Update and draw all cosmic objects
        cosmicObjects.forEach(obj => {
            obj.update(speed);
            obj.draw(ctx, canvas.width, canvas.height, !shouldHardClear && !prefersReducedMotion.matches);
        });

        animationId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (isAnimating) return;
        isAnimating = true;
        resizeCanvas();
        initCosmos();
        animate();
    }

    function stopAnimation() {
        isAnimating = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Start animation only when landing section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAnimation();
            } else {
                stopAnimation();
            }
        });
    });

    const landingSection = $('#landing');
    if (landingSection) {
        observer.observe(landingSection);
    }

    // Handle resize
    window.addEventListener('resize', () => {
        if (isAnimating) {
            resizeCanvas();
        }
    });

    // Respect reduced motion preference changes
    prefersReducedMotion.addEventListener('change', () => {
        if (isAnimating) {
            stopAnimation();
            startAnimation();
        }
    });
})();

/* Typewriter Effect for Boot Sequence */
function typewriterEffect(element, text, speed = 50) {
    return new Promise(resolve => {
        let i = 0;
        element.textContent = '';
        element.style.opacity = '1';

        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                resolve();
            }
        }, speed);
    });
}

/* Startup Animation with Typewriter Effect */
(() => {
    const overlay = document.getElementById('startup-overlay');
    if (!overlay) return;

    const bootLines = $$('.boot-line', overlay);
    const bootCursor = $('.boot-cursor', overlay);

    async function startBootSequence() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const speed = prefersReducedMotion ? 10 : 50; // Faster typing if reduced motion

        for (let i = 0; i < bootLines.length; i++) {
            const line = bootLines[i];
            const text = line.getAttribute('data-text');
            await new Promise(resolve => setTimeout(resolve, 200)); // Small delay between lines
            await typewriterEffect(line, text, speed);
        }

        // Show cursor after boot sequence
        if (bootCursor) {
            bootCursor.style.opacity = '1';
        }

        // Wait a bit then fade out
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
            }, 800);
        }, 1000);
    }

    // Start boot sequence when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startBootSequence);
    } else {
        startBootSequence();
    }

    // Fallback - dismiss on interaction
    ['click', 'keydown', 'wheel', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, () => {
            if (overlay && !overlay.classList.contains('fade-out')) {
                overlay.classList.add('fade-out');
                setTimeout(() => overlay.remove(), 300);
            }
        }, { once: true, passive: true });
    });

    // ESC key to skip
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay && !overlay.classList.contains('fade-out')) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        }
    });
})();

/* Dynamic Header Navigation */
(() => {
    const header = $('#site-header');
    const navLinks = $$('.nav-link');
    if (!header || !navLinks.length) return;

    let lastScrollY = 0;
    let scrollDirection = 'up';
    let isHeaderVisible = true;

    // Throttle scroll events for performance
    let scrollTimeout;
    function handleScroll() {
        if (scrollTimeout) return;

        scrollTimeout = setTimeout(() => {
            const currentScrollY = window.scrollY;
            const isScrollingDown = currentScrollY > lastScrollY;
            const isAtTop = currentScrollY < 100;

            if (isScrollingDown && !isAtTop) {
                if (isHeaderVisible) {
                    header.classList.add('hidden');
                    header.classList.remove('visible', 'minimized');
                    isHeaderVisible = false;
                }
            } else {
                if (!isHeaderVisible) {
                    header.classList.remove('hidden');
                    header.classList.add('visible');
                    isHeaderVisible = true;
                }

                if (isAtTop) {
                    header.classList.remove('minimized');
                } else {
                    header.classList.add('minimized');
                }
            }

            lastScrollY = currentScrollY;
            scrollTimeout = null;
        }, 16); // ~60fps throttle
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Active section highlighting
    const sections = $$('section[id]');
    const observerOptions = {
        rootMargin: '-20% 0% -70% 0%', // Trigger when section is 20% from top
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                const correspondingNavLink = $(`.nav-link[data-section="${sectionId}"], .nav-link[href="#${sectionId}"]`);

                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('is-active'));

                // Add active class to current section's link
                if (correspondingNavLink) {
                    correspondingNavLink.classList.add('is-active');
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    sections.forEach(section => sectionObserver.observe(section));

    // Handle nav link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            const sectionId = link.getAttribute('data-section');

            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = $(href) || $(`#${sectionId}`);

                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
})();

/* Project Cards Animation */
(() => {
    const projects = $$('.project');
    if (!projects.length) return;

    const projectObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0% 0% -10% 0%'
    });

    projects.forEach(project => projectObserver.observe(project));
})();

/* Modal Handlers */
(() => {
    const specButtons = $$('[data-open]');
    const modals = $$('.spec-modal');
    const closeButtons = $$('[data-close]');

    // Open modals
    specButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-open');
            const modal = $(modalId);
            if (modal && typeof modal.showModal === 'function') {
                modal.showModal();
                // Focus management for accessibility
                modal.focus();
            }
        });
    });

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.spec-modal');
            if (modal && typeof modal.close === 'function') {
                modal.close();
            }
        });
    });

    // Close modal when clicking backdrop
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.close();
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = $('.spec-modal[open]');
            if (openModal) {
                openModal.close();
            }
        }
    });
})();

/* 3D Card Interaction */
(() => {
    const titleCard = $('#title-card');
    if (!titleCard) return;

    let isHovering = false;
    const cardInner = $('.card-inner', titleCard);

    titleCard.addEventListener('mouseenter', () => {
        isHovering = true;
    });

    titleCard.addEventListener('mouseleave', () => {
        isHovering = false;
        if (cardInner) {
            cardInner.style.transform = '';
        }
    });

    titleCard.addEventListener('mousemove', (e) => {
        if (!isHovering || !cardInner) return;

        const rect = titleCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        cardInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });

    // Touch support for mobile
    titleCard.addEventListener('touchstart', () => {
        if (cardInner) {
            cardInner.style.transform = 'perspective(1000px) rotateY(15deg) rotateX(-5deg) translateZ(20px)';
        }
    });

    titleCard.addEventListener('touchend', () => {
        if (cardInner) {
            cardInner.style.transform = '';
        }
    });
})();

/* Smooth Scroll Enhancement */
(() => {
    const scrollIndicator = $('.scroll-indicator');
    if (!scrollIndicator) return;

    scrollIndicator.addEventListener('click', () => {
        const aboutSection = $('#about');
        if (aboutSection) {
            const headerHeight = $('#site-header')?.offsetHeight || 0;
            const targetPosition = aboutSection.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
})();

/* Showcase Item Rotation */
(() => {
    const showcaseItems = $$('.showcase-item');
    if (!showcaseItems.length) return;

    let currentIndex = 0;

    function rotateShowcase() {
        showcaseItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentIndex);
        });

        currentIndex = (currentIndex + 1) % showcaseItems.length;
    }

    // Initial state
    rotateShowcase();

    // Rotate every 3 seconds
    setInterval(rotateShowcase, 3000);

    // Pause rotation on hover
    showcaseItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            clearInterval(rotateShowcase);
        });
    });
})();

/* Performance Optimizations */
(() => {
    // Lazy load images when they come into view
    const images = $$('img[data-src]');
    if (images.length) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = 'your-photo.jpg';
    preloadLink.as = 'image';
    document.head.appendChild(preloadLink);
})();

/* Accessibility Enhancements */
(() => {
    // Skip navigation for keyboard users
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--accent);
        color: var(--bg);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s ease;
    `;

    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Announce section changes to screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    document.body.appendChild(announcer);

    // Update announcements when sections change
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionTitle = entry.target.querySelector('h2, .section-heading');
                if (sectionTitle) {
                    announcer.textContent = `Now viewing: ${sectionTitle.textContent}`;
                }
            }
        });
    }, { threshold: 0.5 });

    $$('section[id]').forEach(section => sectionObserver.observe(section));
})();