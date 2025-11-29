document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Functionality
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu() {
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
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Smooth Scroll for Anchor Links
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

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    // Load Projects (Dynamic)
    fetch('proyectos.json')
        .then(response => response.json())
        .then(projects => {
            const projectsContainer = document.getElementById('projects-container');
            if (!projectsContainer) return;

            projects.forEach(project => {
                const card = document.createElement('article');
                card.className = 'project-card';

                // Create tags HTML
                const tagsHtml = project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('');

                // Determine link text and icon
                let linkText = 'Ver en GitHub';
                if (project.link.includes('wikipedia.org')) {
                    linkText = 'Ver en Wikipedia';
                }

                card.innerHTML = `
                    <div class="card-content">
                        <h3 class="card-title">${project.title}</h3>
                        <p class="card-desc">${project.description}</p>
                        <div class="card-tags">
                            ${tagsHtml}
                        </div>
                        <a href="${project.link}" class="card-link" target="_blank">${linkText} →</a>
                    </div>
                `;
                projectsContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error loading projects:', error));

    // Apuntes Logic (Dynamic Loading & Filtering)
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
                notesBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Error cargando apuntes.</td></tr>';
            }
        });

    function renderNotes(filterCategory) {
        if (!notesBody) return;
        notesBody.innerHTML = '';

        const filteredNotes = filterCategory === 'all'
            ? allNotes
            : allNotes.filter(note => note.category === filterCategory);

        if (filteredNotes.length === 0) {
            notesBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No hay apuntes en esta categoría.</td></tr>';
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
                downloadAttr = ''; // No download for links
            }

            row.innerHTML = `
                <td><span class="tag ${note.tagClass}">${note.categoryDisplay}</span></td>
                <td>${note.asignatura}</td>
                <td>${note.title}</td>
                <td><span class="badge-type">${note.type}</span></td>
                <td>${note.date}</td>
                <td><a href="${note.file}" class="btn-icon" aria-label="Abrir ${note.extension}" ${targetAttr} ${downloadAttr}>${actionIcon}</a></td>
            `;

            // Animation
            row.style.animation = 'fadeIn 0.5s ease forwards';
            notesBody.appendChild(row);
        });
    }

    // Tab Click Event
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleSheet);
