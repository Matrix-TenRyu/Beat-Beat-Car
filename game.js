// Get DOM elements
const playerCountElement = document.getElementById('playerCount');
const videoContainer = document.getElementById('videoContainer');
const videoPlayer = document.getElementById('videoPlayer');
const videoUrl = document.getElementById('videoUrl');
const loadVideoBtn = document.getElementById('loadVideo');
const toggleVideoBtn = document.getElementById('toggleVideo');
const showVideoBtn = document.getElementById('showVideo');

// Create life bar container
const lifeBarContainer = document.createElement('div');
lifeBarContainer.style.position = 'fixed';
lifeBarContainer.style.top = '20px';
lifeBarContainer.style.left = '20px';
lifeBarContainer.style.width = '200px';
lifeBarContainer.style.height = '20px';
lifeBarContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
lifeBarContainer.style.border = '2px solid white';
document.body.appendChild(lifeBarContainer);

// Create life bar
const lifeBar = document.createElement('div');
lifeBar.style.width = '100%';
lifeBar.style.height = '100%';
lifeBar.style.backgroundColor = '#00ff00';
lifeBar.style.transition = 'width 0.3s ease-out';
lifeBarContainer.appendChild(lifeBar);

// Create speed indicator
const speedIndicator = document.createElement('div');
speedIndicator.style.position = 'fixed';
speedIndicator.style.top = '50px';
speedIndicator.style.left = '20px';
speedIndicator.style.color = 'white';
speedIndicator.style.fontFamily = 'Arial, sans-serif';
speedIndicator.style.fontSize = '16px';
speedIndicator.style.textShadow = '2px 2px 2px rgba(0, 0, 0, 0.5)';
document.body.appendChild(speedIndicator);

let ytPlayer = null;
let twPlayer = null;
let videoScreen = null;
let currentVideo = null;

// Video player functionality
function getVideoType(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    } else if (url.includes('twitch.tv')) {
        return 'twitch';
    }
    return null;
}

function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function getTwitchChannelName(url) {
    const parts = url.split('/');
    return parts[parts.length - 1];
}

// Create video screen in 3D space
function createVideoScreen() {
    // Create a backing plane for the screen
    const backingGeometry = new THREE.PlaneGeometry(42, 24.5);
    const backingMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        side: THREE.DoubleSide
    });
    const backingPlane = new THREE.Mesh(backingGeometry, backingMaterial);
    backingPlane.position.set(0, 15, -40);
    backingPlane.rotation.x = Math.PI * 0.1;
    scene.add(backingPlane);

    // Create the video screen
    const screenGeometry = new THREE.PlaneGeometry(40, 22.5);
    const screenMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    });
    videoScreen = new THREE.Mesh(screenGeometry, screenMaterial);
    videoScreen.position.set(0, 15, -39.9);
    videoScreen.rotation.x = Math.PI * 0.1;
    scene.add(videoScreen);

    // Add ambient light to the screen area
    const screenLight = new THREE.PointLight(0xffffff, 0.5);
    screenLight.position.set(0, 20, -35);
    scene.add(screenLight);
}

function loadYouTubeVideo(videoId) {
    videoPlayer.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    videoPlayer.appendChild(iframe);
}

function loadTwitchStream(channel) {
    videoPlayer.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.src = `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&muted=true`;
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    videoPlayer.appendChild(iframe);
}

// Initialize video container state
videoContainer.style.display = 'block';
showVideoBtn.style.display = 'none';

loadVideoBtn.addEventListener('click', () => {
    const url = videoUrl.value.trim();
    const type = getVideoType(url);
    
    if (type === 'youtube') {
        const videoId = getYouTubeVideoId(url);
        if (videoId) {
            loadYouTubeVideo(videoId);
        } else {
            alert('Invalid YouTube URL');
        }
    } else if (type === 'twitch') {
        const channel = getTwitchChannelName(url);
        if (channel) {
            loadTwitchStream(channel);
        } else {
            alert('Invalid Twitch URL');
        }
    } else {
        alert('Please enter a valid YouTube or Twitch URL');
    }
});

toggleVideoBtn.addEventListener('click', () => {
    videoContainer.style.display = 'none';
    showVideoBtn.style.display = 'block';
});

showVideoBtn.addEventListener('click', () => {
    videoContainer.style.display = 'block';
    showVideoBtn.style.display = 'none';
});

// Three.js setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Light blue sky

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 50);
scene.add(directionalLight);

// Create green field
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2f9f3f,
    roughness: 0.8,
    metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Add simple borders
function createBorder() {
    const wallGeometry = new THREE.BoxGeometry(2, 5, 200);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.8
    });

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-100, 2.5, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(100, 2.5, 0);
    scene.add(rightWall);

    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    frontWall.rotation.y = Math.PI / 2;
    frontWall.position.set(0, 2.5, -100);
    scene.add(frontWall);

    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.rotation.y = Math.PI / 2;
    backWall.position.set(0, 2.5, 100);
    scene.add(backWall);
}

createBorder();

// Create explosion particles
function createExplosionParticles() {
    const particles = [];
    const particleCount = 50;
    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        emissive: 0xff0000,
        emissiveIntensity: 2
    });

    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.visible = false;
        scene.add(particle);
        particles.push({
            mesh: particle,
            velocity: new THREE.Vector3(),
            life: 0
        });
    }
    return particles;
}

// Car class
class Car {
    constructor(x, y, color) {
        // Create car body
        const carGeometry = new THREE.BoxGeometry(2, 1, 4);
        const carMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.7,
            metalness: 0.3
        });
        this.mesh = new THREE.Mesh(carGeometry, carMaterial);
        
        // Create car roof
        const roofGeometry = new THREE.BoxGeometry(1.8, 0.8, 2);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.7,
            metalness: 0.3
        });
        this.roof = new THREE.Mesh(roofGeometry, roofMaterial);
        this.roof.position.y = 0.9;
        
        // Create car group
        this.group = new THREE.Group();
        this.group.add(this.mesh);
        this.group.add(this.roof);
        
        // Add wheels
        this.wheels = [];
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 32);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        const wheelPositions = [
            { x: -1.1, y: -0.3, z: 1.5 },
            { x: 1.1, y: -0.3, z: 1.5 },
            { x: -1.1, y: -0.3, z: -1.5 },
            { x: 1.1, y: -0.3, z: -1.5 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, pos.y, pos.z);
            this.wheels.push(wheel);
            this.group.add(wheel);
        });
        
        this.group.position.set(x, 1, y);
        scene.add(this.group);
        
        this.speed = 0;
        this.rotation = 0;
        this.acceleration = 0.02;
        this.maxSpeed = 1.0; // Increased for 500km/h
        this.friction = 0.98;
        this.turnSpeed = 0.03;
        
        // Add health system
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.lastCollisionTime = 0;
        this.collisionCooldown = 500;
        
        // Add explosion particles
        this.explosionParticles = createExplosionParticles();
        this.isExploding = false;
        this.explosionTime = 0;
        this.explosionDuration = 2000; // 2 seconds
        
        this.direction = new THREE.Vector3(0, 0, -1);
        this.cameraOffset = new THREE.Vector3(0, 3, 8);
        this.cameraLerpFactor = 0.1;
        this.currentCameraPosition = new THREE.Vector3();
        this.currentCameraTarget = new THREE.Vector3();
    }

    explode() {
        this.isExploding = true;
        this.explosionTime = Date.now();
        
        // Hide car parts
        this.mesh.visible = false;
        this.roof.visible = false;
        this.wheels.forEach(wheel => wheel.visible = false);
        
        // Initialize particles
        const position = this.group.position.clone();
        this.explosionParticles.forEach(particle => {
            particle.mesh.position.copy(position);
            particle.mesh.visible = true;
            
            // Random velocity in all directions
            particle.velocity.set(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            particle.life = 1.0;
        });
    }

    updateExplosion() {
        if (!this.isExploding) return;

        const progress = (Date.now() - this.explosionTime) / this.explosionDuration;
        
        if (progress >= 1) {
            // End explosion
            this.isExploding = false;
            this.explosionParticles.forEach(particle => {
                particle.mesh.visible = false;
            });
            this.respawn();
            return;
        }

        // Update particles
        this.explosionParticles.forEach(particle => {
            if (particle.life > 0) {
                // Update position
                particle.mesh.position.add(particle.velocity);
                
                // Add gravity effect
                particle.velocity.y -= 0.01;
                
                // Fade out
                particle.life -= 0.02;
                particle.mesh.material.opacity = particle.life;
                
                // Scale down
                const scale = particle.life * 2;
                particle.mesh.scale.set(scale, scale, scale);
                
                // Update color
                const color = new THREE.Color();
                color.setHSL(0.1 - particle.life * 0.1, 1, 0.5 + particle.life * 0.5);
                particle.mesh.material.color = color;
            } else {
                particle.mesh.visible = false;
            }
        });
    }

    respawn() {
        // Show car parts
        this.mesh.visible = true;
        this.roof.visible = true;
        this.wheels.forEach(wheel => wheel.visible = true);
        
        this.health = this.maxHealth;
        this.speed = 0;
        this.group.position.set(0, 1, 0);
        this.rotation = 0;
        lifeBar.style.width = '100%';
        lifeBar.style.backgroundColor = '#00ff00';
    }

    takeDamage(amount) {
        const now = Date.now();
        if (now - this.lastCollisionTime >= this.collisionCooldown) {
            this.health = Math.max(0, this.health - amount);
            this.lastCollisionTime = now;
            
            // Update life bar
            lifeBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
            
            // Change life bar color based on health
            if (this.health > 60) {
                lifeBar.style.backgroundColor = '#00ff00';
            } else if (this.health > 30) {
                lifeBar.style.backgroundColor = '#ffff00';
            } else {
                lifeBar.style.backgroundColor = '#ff0000';
            }

            // Add visual feedback
            this.mesh.material.emissive.setHex(0xff0000);
            setTimeout(() => {
                this.mesh.material.emissive.setHex(0x000000);
            }, 200);

            if (this.health <= 0 && !this.isExploding) {
                this.explode();
            }
        }
    }

    checkCollision() {
        const bounds = 98;
        const position = this.group.position;
        const collisionThreshold = 1.5;
        
        if (Math.abs(position.x) >= bounds - collisionThreshold || 
            Math.abs(position.z) >= bounds - collisionThreshold) {
            
            // Calculate speed in km/h
            const speedKmh = Math.abs(this.speed) * 500;
            
            // Calculate damage as percentage of current health (10% per 100km/h)
            const damagePercentage = speedKmh / 10; // Example: 300km/h = 30%
            const damage = (this.maxHealth * damagePercentage) / 100;
            
            // Add visual feedback text
            this.showDamageText(damagePercentage);
            
            this.takeDamage(damage);
            
            // Bounce effect
            this.speed = -this.speed * 0.5;
        }
    }

    showDamageText(percentage) {
        // Create damage text element
        const damageText = document.createElement('div');
        damageText.style.position = 'fixed';
        damageText.style.color = '#ff0000';
        damageText.style.fontSize = '24px';
        damageText.style.fontWeight = 'bold';
        damageText.style.textShadow = '2px 2px 2px rgba(0, 0, 0, 0.5)';
        damageText.style.transition = 'all 0.5s ease-out';
        damageText.textContent = `-${percentage.toFixed(1)}%`;

        // Convert 3D position to screen coordinates
        const vector = this.group.position.clone();
        vector.project(camera);
        
        // Convert to screen coordinates
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        
        // Position the text
        damageText.style.left = `${x}px`;
        damageText.style.top = `${y}px`;
        
        // Add to document
        document.body.appendChild(damageText);
        
        // Animate and remove
        setTimeout(() => {
            damageText.style.opacity = '0';
            damageText.style.transform = 'translateY(-50px)';
        }, 50);
        
        setTimeout(() => {
            document.body.removeChild(damageText);
        }, 1000);
    }

    update() {
        if (this.isExploding) {
            this.updateExplosion();
            return;
        }

        this.direction.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        
        const newX = this.group.position.x + this.direction.x * this.speed;
        const newZ = this.group.position.z + this.direction.z * this.speed;
        
        const bounds = 98;
        const newPosX = Math.max(-bounds, Math.min(bounds, newX));
        const newPosZ = Math.max(-bounds, Math.min(bounds, newZ));
        
        this.group.position.x = newPosX;
        this.group.position.z = newPosZ;
        this.group.rotation.y = this.rotation;
        
        // Check for collisions
        this.checkCollision();
        
        // Update speed
        this.speed *= this.friction;

        // Update speed indicator (adjusted for 500km/h max speed)
        const speedKmh = Math.abs(this.speed) * 500;
        speedIndicator.textContent = `Speed: ${speedKmh.toFixed(1)} km/h`;
        
        // Change speed indicator color based on speed
        const speedPercentage = Math.abs(this.speed) / this.maxSpeed;
        if (speedPercentage > 0.8) {
            speedIndicator.style.color = '#ff0000';
        } else if (speedPercentage > 0.5) {
            speedIndicator.style.color = '#ffff00';
        } else {
            speedIndicator.style.color = '#ffffff';
        }

        this.wheels.forEach(wheel => {
            wheel.rotation.x += this.speed * 0.5;
        });

        const idealOffset = this.cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        const idealPosition = this.group.position.clone().add(idealOffset);
        
        if (!this.currentCameraPosition.equals(idealPosition)) {
            this.currentCameraPosition.lerp(idealPosition, this.cameraLerpFactor);
            camera.position.copy(this.currentCameraPosition);
        }

        const targetOffset = new THREE.Vector3(0, 1, -4).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        const idealTarget = this.group.position.clone().add(targetOffset);
        
        if (!this.currentCameraTarget.equals(idealTarget)) {
            this.currentCameraTarget.lerp(idealTarget, this.cameraLerpFactor);
            camera.lookAt(this.currentCameraTarget);
        }
    }
}

// Connect to the server
const socket = io();

// Create player's car
let player = new Car(0, 0, 0xff0000);

// Store other players
const otherPlayers = new Map();

// Socket.IO event handlers
socket.on('currentPlayers', (players) => {
    players.forEach(([id, playerData]) => {
        if (id !== socket.id) {
            otherPlayers.set(id, new Car(playerData.x, playerData.z, playerData.color));
        }
    });
});

socket.on('playerMoved', (playerData) => {
    const car = otherPlayers.get(playerData.id);
    if (car) {
        car.group.position.x = playerData.x;
        car.group.position.z = playerData.y;
        car.rotation = playerData.rotation;
        car.speed = playerData.speed;
    }
});

socket.on('playerLeft', (playerId) => {
    const car = otherPlayers.get(playerId);
    if (car) {
        scene.remove(car.group);
        otherPlayers.delete(playerId);
    }
});

socket.on('playerCount', (count) => {
    playerCountElement.textContent = `Players: ${count}`;
});

// Input handling
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Set up initial camera position
camera.position.set(0, 20, 20);
camera.lookAt(0, 0, 0);

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Game loop
function gameLoop() {
    if (keys.ArrowUp) {
        player.speed = Math.min(player.speed + player.acceleration, player.maxSpeed);
    }
    if (keys.ArrowDown) {
        player.speed = Math.max(player.speed - player.acceleration, -player.maxSpeed/2);
    }
    if (keys.ArrowLeft) {
        player.rotation += player.turnSpeed;
    }
    if (keys.ArrowRight) {
        player.rotation -= player.turnSpeed;
    }

    player.update();

    socket.emit('updatePlayer', {
        x: player.group.position.x,
        y: player.group.position.z,
        rotation: player.rotation,
        speed: player.speed,
        color: player.mesh.material.color.getHex()
    });

    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
}

// Start the game loop immediately
gameLoop(); 