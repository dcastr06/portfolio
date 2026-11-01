// ─── 1. Typewriter Terminal Effect (Instant & Rock-solid) ───
function initTypewriter() {
    const typewriterEl = document.getElementById('typewriter');
    if (!typewriterEl || typewriterEl.dataset.typed === 'true') return;
    typewriterEl.dataset.typed = 'true';

    const fullText = "¡Buenas!, soy David";
    const highlightWord = "David";
    let charIndex = 0;
    typewriterEl.innerHTML = '';

    function typeKeystroke() {
        if (charIndex <= fullText.length) {
            const currentSub = fullText.substring(0, charIndex);
            if (currentSub.indexOf(highlightWord) !== -1) {
                const prefix = currentSub.substring(0, currentSub.indexOf(highlightWord));
                const highlight = currentSub.substring(currentSub.indexOf(highlightWord));
                typewriterEl.innerHTML = `${prefix}<span class="text-gradient">${highlight}</span>`;
            } else {
                typewriterEl.textContent = currentSub;
            }
            charIndex++;
            // Natural typing cadence (between 60ms and 110ms)
            const delay = Math.floor(Math.random() * 50) + 65;
            setTimeout(typeKeystroke, delay);
        }
    }

    setTimeout(typeKeystroke, 250);
}

// Ensure execution regardless of DOM state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypewriter);
} else {
    initTypewriter();
}

document.addEventListener('DOMContentLoaded', () => {
    // ─── 2. Mobile Menu Functionality ───
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu() {
        if (!mobileBtn || !navMenu) return;
        mobileBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    }

    if (mobileBtn) {
        mobileBtn.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // ─── 3. Smooth Scroll for Anchor Links ───
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── 4. Navbar Scroll Effect ───
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ─── 5. Load Projects (Dynamic with Audacious Card Design) ───
    fetch('proyectos.json')
        .then(response => response.json())
        .then(projects => {
            const projectsContainer = document.getElementById('projects-container');
            if (!projectsContainer) return;

            projects.forEach((project, index) => {
                const card = document.createElement('article');
                card.className = 'project-card';

                // Create tags HTML
                const tagsHtml = project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('');

                // Determine link text
                let linkText = 'Ver en GitHub';
                if (project.link.includes('wikipedia.org')) {
                    linkText = 'Ver en Wikipedia';
                }

                const cardIndex = String(index + 1).padStart(2, '0');

                card.innerHTML = `
                    <div class="card-content">
                        <div class="card-top-meta">
                            <span class="card-cyber-badge">PROYECTO #${cardIndex}</span>
                            <span class="card-status"><span class="status-dot"></span>ONLINE</span>
                        </div>
                        <h3 class="card-title">${project.title}</h3>
                        <p class="card-desc">${project.description}</p>
                        <div class="card-tags">
                            ${tagsHtml}
                        </div>
                        <a href="${project.link}" class="card-link" target="_blank" rel="noopener noreferrer">
                            <span>${linkText}</span>
                            <span class="link-arrow">→</span>
                        </a>
                    </div>
                `;
                projectsContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error loading projects:', error));

    // ─── 6. Apuntes Logic (Dynamic Loading & Filtering) ───
    const tabBtns = document.querySelectorAll('.tab-btn');
    const notesBody = document.getElementById('notes-body');
    let allNotes = [];

    // Fetch Notes
    fetch('apuntes.json')
        .then(response => response.json())
        .then(data => {
            allNotes = data;
            renderNotes('all');
        })
        .catch(error => {
            console.error('Error loading notes:', error);
            if (notesBody) {
                notesBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 25px;">Error cargando apuntes.</td></tr>';
            }
        });

    function renderNotes(filterCategory) {
        if (!notesBody) return;
        notesBody.innerHTML = '';

        const filteredNotes = filterCategory === 'all'
            ? allNotes
            : allNotes.filter(note => note.category === filterCategory);

        if (filteredNotes.length === 0) {
            notesBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 30px;">No hay apuntes en esta categoría.</td></tr>';
            return;
        }

        filteredNotes.forEach(note => {
            const row = document.createElement('tr');
            row.setAttribute('data-category', note.category);

            let actionIcon = '⬇ PDF';
            let targetAttr = '';
            let downloadAttr = 'download';

            if (note.extension === 'ZIP') {
                actionIcon = '📦 ZIP';
            } else if (note.extension === 'LINK') {
                actionIcon = '🔗 GitHub';
                targetAttr = 'target="_blank" rel="noopener noreferrer"';
                downloadAttr = '';
            }

            row.innerHTML = `
                <td><span class="tag ${note.tagClass}">${note.categoryDisplay}</span></td>
                <td><strong class="subject-name">${note.asignatura}</strong></td>
                <td>${note.title}</td>
                <td><span class="badge-type">${note.type}</span></td>
                <td><a href="${note.file}" class="btn-action-icon" aria-label="Abrir ${note.extension}" ${targetAttr} ${downloadAttr}>${actionIcon}</a></td>
            `;

            row.style.animation = 'fadeIn 0.35s ease forwards';
            notesBody.appendChild(row);
        });
    }

    // Tab Click Event
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-tab');
            renderNotes(category);
        });
    });
});

// Add keyframes for fade in
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleSheet);
