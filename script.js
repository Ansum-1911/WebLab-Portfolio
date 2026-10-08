/* =====================================================
   script.js
   1. Light / dark theme toggle (remembers the choice)
   2. Gallery filter
   3. Contact form validation (front-end demo only)
   4. Highlight the current section in the navigation
===================================================== */

/* ---------- 1. Theme toggle ---------- */

const root = document.documentElement;
const themeButton = document.getElementById('theme-toggle');

function applyTheme(theme) {
    if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
    } else {
        root.removeAttribute('data-theme');
    }
    themeButton.setAttribute('aria-pressed', String(theme === 'light'));
}

function loadSavedTheme() {
    try {
        return localStorage.getItem('portfolio-theme');
    } catch (error) {
        return null; // storage can be blocked; fall back to default
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem('portfolio-theme', theme);
    } catch (error) {
        /* ignore: the toggle still works for this visit */
    }
}

applyTheme(loadSavedTheme() === 'light' ? 'light' : 'dark');

themeButton.addEventListener('click', function () {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    saveTheme(next);
});


/* ---------- 2. Gallery filter ---------- */

const filterButtons = document.querySelectorAll('.filter-btn');
const figures = document.querySelectorAll('.gallery-grid figure');
const galleryStatus = document.getElementById('gallery-status');

function filterGallery(category) {
    let shown = 0;

    figures.forEach(function (figure) {
        const match = category === 'all' || figure.dataset.category === category;
        figure.hidden = !match;
        if (match) {
            shown++;
        }
    });

    filterButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.filter === category));
    });

    galleryStatus.textContent =
        'Showing ' + shown + ' of ' + figures.length + ' screenshot' + (figures.length === 1 ? '' : 's') + '.';
}

filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        filterGallery(button.dataset.filter);
    });
});


/* ---------- 3. Contact form validation ---------- */
/* The form is a front-end demonstration: nothing is sent or stored. */

const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

const rules = {
    name: function (field) {
        return field.value.trim().length < 2 ? 'Enter your name (at least 2 characters).' : '';
    },
    email: function (field) {
        if (field.value.trim() === '') {
            return 'Enter your email address.';
        }
        return field.validity.typeMismatch ? 'Enter a valid email address, like you@example.com.' : '';
    },
    topic: function (field) {
        return field.value === '' ? 'Choose what you are writing about.' : '';
    },
    message: function (field) {
        return field.value.trim().length < 10 ? 'Write a message of at least 10 characters.' : '';
    },
    consent: function (field) {
        return field.checked ? '' : 'Tick the box to confirm you understand nothing is sent.';
    }
};

function checkField(field) {
    const message = rules[field.name](field);
    const errorBox = document.getElementById(field.id + '-error');

    errorBox.textContent = message;
    if (message) {
        field.setAttribute('aria-invalid', 'true');
    } else {
        field.removeAttribute('aria-invalid');
    }
    return message === '';
}

// Re-check a field after the person has touched it, so errors clear as they fix them.
Object.keys(rules).forEach(function (name) {
    const field = form.elements[name];
    const eventName = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'blur';
    field.addEventListener(eventName, function () {
        checkField(field);
    });
    field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') {
            checkField(field);
        }
    });
});

form.addEventListener('submit', function (event) {
    event.preventDefault(); // no backend, so never actually submit

    let firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
        const field = form.elements[name];
        if (!checkField(field) && !firstInvalid) {
            firstInvalid = field;
        }
    });

    if (firstInvalid) {
        formStatus.textContent = 'Please fix the highlighted fields and try again.';
        firstInvalid.focus();
        return;
    }

    const name = form.elements.name.value.trim();
    form.reset(); // clears the fields (and runs the reset handler below)
    formStatus.textContent =
        'Thanks, ' + name + '. Your message passed all checks. Nothing was sent because this is a demonstration form.';
});

form.addEventListener('reset', function () {
    Object.keys(rules).forEach(function (name) {
        const field = form.elements[name];
        field.removeAttribute('aria-invalid');
        document.getElementById(field.id + '-error').textContent = '';
    });
    formStatus.textContent = '';
});


/* ---------- 4. Current section in the navigation ---------- */

const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = document.querySelectorAll('header[id], main section[id]');

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                navLinks.forEach(function (link) {
                    if (link.getAttribute('href') === '#' + entry.target.id) {
                        link.setAttribute('aria-current', 'true');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (section) {
        observer.observe(section);
    });
}
