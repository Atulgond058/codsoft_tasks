document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.querySelector('.navbar');

    if (mobileMenu && navbar) {
        mobileMenu.addEventListener('click', () => {
            navbar.classList.toggle('active');
            const icon = mobileMenu.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }
    const themeToggleBtn = document.getElementById('theme-toggle');

    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('i');
    
        // Check page reload setup
        if (localStorage.getItem('theme') === 'light') {
            document.body.classList.add('light-mode');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        } else{
            document.body.classList.remove('light-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }

        }
    
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            
            const isLight = document.body.classList.contains('light-mode');
            
            if (themeIcon) {
                if (isLight) {
                    // Light Mode me Moon icon dikhao (Dark karne ke liye)
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                } else {
                    // Dark Mode me Sun icon dikhao (Light karne ke liye)
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
            }
            
            // Theme save karein
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }
    
    // 2. Active Page Highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 3. Form Validation (Contact Page)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');
        const formStatus = document.getElementById('form-status');

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;

            // Clear previous errors
            document.querySelectorAll('.error-msg').forEach(msg => msg.textContent = '');
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            // Validate Name
            if (!nameInput.value.trim()) {
                document.getElementById('name-error').textContent = 'Full Name is required.';
                isValid = false;
            }

            // Validate Email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim()) {
                document.getElementById('email-error').textContent = 'Email Address is required.';
                isValid = false;
            } else if (!emailPattern.test(emailInput.value.trim())) {
                document.getElementById('email-error').textContent = 'Please enter a valid email address.';
                isValid = false;
            }

            // Validate Subject
            if (!subjectInput.value.trim()) {
                document.getElementById('subject-error').textContent = 'Subject is required.';
                isValid = false;
            }

             // Validate Message
            if (!messageInput.value.trim()) {
                document.getElementById('message-error').textContent = 'Message content cannot be empty.';
                isValid = false;
            }

            if (isValid) {
                formStatus.textContent = 'Message sent successfully! Thank you for reaching out.';
                formStatus.classList.add('success');
                contactForm.reset();

                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }, 5000);
            } else {
                formStatus.textContent = 'Please fix the errors above before submitting.';
                formStatus.classList.add('error');
            }
        });
    }
});

// Array containing data matched to your image
const interestsData = [
    { label: "Coding", iconClass: "fa-solid fa-code", bg: "#00a2ff" },
    { label: "AI Research", iconClass: "fa-solid fa-brain", bg: "#c042da" },
    { label: "Gaming", iconClass: "fa-solid fa-gamepad", bg: "#10b981" },
    { label: "Music", iconClass: "fa-solid fa-music", bg: "#f59e0b" },
    { label: "Photography", iconClass: "fa-solid fa-camera", bg: "#f43f5e" },
    { label: "Video Editing", iconClass: "fa-solid fa-video", bg: "#8b5cf6" }
  ];
  
  // Function to render elements dynamically
  function renderInterests() {
    const container = document.getElementById("interestsContainer");
    container.innerHTML = ""; // Clear existing
  
    interestsData.forEach(item => {
      const interestDiv = document.createElement("div");
      interestDiv.className = "interest-item";
  
      interestDiv.innerHTML = `
        <div class="icon-box" style="background-color: ${item.bg};">
          <i class="${item.iconClass}"></i>
        </div>
        <span class="interest-label">${item.label}</span>
      `;
  
      container.appendChild(interestDiv);
    });
  }
  
  // Initialize rendering on load
  document.addEventListener("DOMContentLoaded", renderInterests);

  document.addEventListener("DOMContentLoaded", () => {
  const getInTouchBtn = document.getElementById("getInTouchBtn");
  const downloadResumeBtn = document.getElementById("downloadResumeBtn");

  getInTouchBtn?.addEventListener("click", () => {
    window.location.href = "mailto:atulgond058@gmail.com";
  });

  downloadResumeBtn?.addEventListener("click", () => {
    alert("Resume download started!");
    // window.open('resume.pdf', '_blank');
  });
});