// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const EMAIL_ENDPOINT = 'https://formspree.io/f/xblnygnv';

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            if (!name || !email || !message) {
                showNotification('Please fill in your name, email, and message to continue.', 'error');
                return;
            }

            // Send to Formspree (or replace with your email API)
            try {
                const res = await fetch(EMAIL_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });

                if (res.ok) {
                    showNotification('Thanks! Your message was sent.', 'success');
                    contactForm.reset();
                } else {
                    showNotification('Could not send right now. Please try again later.', 'error');
                }
            } catch (err) {
                showNotification('Network error. Please try again.', 'error');
            }
        });
    }

    // Notification function for better UX
    function showNotification(message, type) {
        // Remove any existing notification
        var existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        var notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        notification.style.cssText = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); padding: 1rem 2rem; border-radius: 8px; font-weight: 500; z-index: 1001; animation: slideIn 0.3s ease;';
        
        if (type === 'success') {
            notification.style.background = '#10b981';
            notification.style.color = 'white';
        } else {
            notification.style.background = '#ef4444';
            notification.style.color = 'white';
        }

        document.body.appendChild(notification);

        // Remove notification after 4 seconds
        setTimeout(function() {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.3s ease';
                setTimeout(function() {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
    }

    // Add scroll effect to header
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            } else {
                header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';
            }
        });
    }

    // Mini runner game (simple dino-style jumper)
    (function initRunnerGame() {
        const canvas = document.getElementById('runner-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const statusEl = document.getElementById('game-status');
        const scoreEl = document.getElementById('game-score');
        const btn = document.getElementById('runner-btn');

        const groundLevel = canvas.height - 34;
        const player = { x: 40, y: groundLevel - 28, width: 28, height: 28, vy: 0, onGround: true };
        let obstacles = [];
        let score = 0;
        let speed = 4.2;
        let spawnCountdown = 70;
        let gameRunning = false;
        let gameOver = false;
        let lastTime = 0;

        function resetGame() {
            obstacles = [];
            score = 0;
            speed = 4.2;
            spawnCountdown = 60;
            player.y = groundLevel - player.height;
            player.vy = 0;
            player.onGround = true;
            gameRunning = true;
            gameOver = false;
            lastTime = 0;
            setStatus('Running...');
            updateScore();
            requestAnimationFrame(loop);
        }

        function setStatus(text) {
            if (statusEl) statusEl.textContent = text;
        }

        function updateScore() {
            if (scoreEl) scoreEl.textContent = 'Score: ' + Math.floor(score);
        }

        function spawnObstacle() {
            const width = 18 + Math.random() * 18;
            const height = 24 + Math.random() * 18;
            obstacles.push({
                x: canvas.width + Math.random() * 60,
                y: groundLevel - height,
                width,
                height
            });
        }

        function jump() {
            if (!gameRunning) {
                resetGame();
                return;
            }
            if (player.onGround) {
                player.vy = -9.5;
                player.onGround = false;
            }
        }

        function drawPlayer() {
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        function drawGround() {
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundLevel + 14);
            ctx.lineTo(canvas.width, groundLevel + 14);
            ctx.stroke();
        }

        function drawObstacles() {
            ctx.fillStyle = '#ef4444';
            obstacles.forEach(ob => {
                ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
            });
        }

        function checkCollision() {
            return obstacles.some(ob => {
                return (
                    player.x < ob.x + ob.width &&
                    player.x + player.width > ob.x &&
                    player.y < ob.y + ob.height &&
                    player.y + player.height > ob.y
                );
            });
        }

        function loop(timestamp) {
            if (!gameRunning) return;
            if (!lastTime) lastTime = timestamp;
            const delta = Math.min((timestamp - lastTime) / 16.67, 3);
            lastTime = timestamp;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGround();

            // Physics
            player.vy += 0.6 * delta;
            player.y += player.vy * delta;
            const floorY = groundLevel - player.height;
            if (player.y >= floorY) {
                player.y = floorY;
                player.vy = 0;
                player.onGround = true;
            }

            // Obstacles
            spawnCountdown -= delta;
            if (spawnCountdown <= 0) {
                spawnObstacle();
                spawnCountdown = 55 + Math.random() * 45;
            }

            obstacles.forEach(ob => {
                ob.x -= speed * delta;
            });
            obstacles = obstacles.filter(ob => ob.x + ob.width > 0);

            drawObstacles();
            drawPlayer();

            // Scoring and difficulty
            score += 0.4 * delta;
            speed += 0.0025 * delta;
            updateScore();

            if (checkCollision()) {
                gameRunning = false;
                gameOver = true;
                setStatus('Game over — press space to retry');
                return;
            }

            requestAnimationFrame(loop);
        }

        function handleKey(e) {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (gameOver) {
                    resetGame();
                    return;
                }
                jump();
            }
        }

        if (btn) {
            btn.addEventListener('click', () => {
                if (gameOver || !gameRunning) {
                    resetGame();
                } else {
                    jump();
                }
            });
        }

        ['keydown'].forEach(evt => document.addEventListener(evt, handleKey));
        canvas.addEventListener('pointerdown', function() {
            if (gameOver || !gameRunning) {
                resetGame();
            } else {
                jump();
            }
        });

        setStatus('Space');
    })();
});
