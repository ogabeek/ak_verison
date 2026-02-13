// ============================================
// DATA & CONFIGURATION
// ============================================

const courseColorConfigs = {
  blue: {
    icon: '#dbeafe',
    button: '#3b82f6',
    particles: ['rgba(59,130,246,', 'rgba(96,165,250,'],
  },
  green: {
    icon: '#d1fae5',
    button: '#10b981',
    particles: ['rgba(16,185,129,', 'rgba(52,211,153,'],
  },
  orange: {
    icon: '#fef3c7',
    button: '#f59e0b',
    particles: ['rgba(245,158,11,', 'rgba(251,191,36,'],
  },
  purple: {
    icon: '#ede9fe',
    button: '#8b5cf6',
    particles: ['rgba(139,92,246,', 'rgba(167,139,250,'],
  },
  pink: {
    icon: '#fce7f3',
    button: '#ec4899',
    particles: ['rgba(236,72,153,', 'rgba(244,114,182,'],
  },
  cyan: {
    icon: '#cffafe',
    button: '#06b6d4',
    particles: ['rgba(6,182,212,', 'rgba(34,211,238,'],
  },
};

// Course ID mapping: frontend ID → Moodle course ID
const courseMoodleMap = {
  python1: 297,
  python2: 308,
  math101: 220,
  'math-ml': null, // Coming soon
};

const courses = {
  python1: {
    moodleId: 297,
    name: 'Python 1',
    level: 'Beginner',
    description: 'Master the fundamentals of Python programming with hands-on projects and interactive coding exercises.',
    icon: '🐍',
    color: 'blue',
    stats: { lessons: 260, duration: '4h' }, // 260 exercises across 28 quizzes
  },
  python2: {
    moodleId: 308,
    name: 'Python 2',
    level: 'Advanced',
    description: 'Advanced Python concepts including OOP, web frameworks, and real-world application development.',
    icon: '🚀',
    color: 'green',
    stats: { lessons: 196, duration: '6h' }, // 196 exercises across 25 quizzes
  },
  math101: {
    moodleId: 220,
    name: 'Math 101',
    level: 'Foundation',
    description: 'Build a strong mathematical foundation with interactive problem-solving and visual learning tools.',
    icon: '📐',
    color: 'orange',
    stats: { lessons: 377, duration: '5h' }, // 377 exercises across 35 quizzes
  },
  'math-ml': {
    moodleId: null,
    name: 'Math for ML',
    level: 'Advanced',
    description: 'Learn data analysis, visualization, and machine learning fundamentals with Python and popular libraries.',
    icon: '🤖',
    color: 'purple',
    stats: { lessons: 100, duration: '8h' },
    comingSoon: true,
  },
};

// Default progress for guests (will be updated with real data for logged-in users)
const courseProgress = {
  python1: 0,
  python2: 0,
  math101: 0,
  'math-ml': 0,
};

const courseColorMap = {
  python1: 'blue',
  python2: 'green',
  math101: 'orange',
  datascience: 'purple',
  webdev: 'pink',
  algorithms: 'cyan',
  'math-ml': 'purple',
};

// ============================================
// PARTICLE SYSTEM
// ============================================

const NODE_SIZE = 4;
const LINE_COLOR = "rgba(240,240,240,1)";
const NODES_DISTANCE = 35;
const SPEED_DAMPING = 0.8;
const EMPTY_COURSE_NODES_COUNT = 5;

class Particle {
  constructor(x, y, size, colorPrefix, opacity, parent, group) {
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.hasParent = parent !== -1;
    this.parentX = 0;
    this.parentY = 0;
    this.parentSize = 0;
    this.baseSize = size;
    this.opacity = opacity;
    this.colorPrefix = colorPrefix;
    this.size = this.baseSize;
    this.timeOffset = Math.random() * Math.PI * 2;
    this.velocityX = 0;
    this.velocityY = 0;
    this.group = group;
    this.pulse = 1;
  }
  
  update(time, parentX, parentY, parentSize) {
    this.pulse = Math.sin(time * 0.01 + this.timeOffset);
    this.size = this.baseSize * (1 + this.pulse * 0.1);
    this.velocityX *= SPEED_DAMPING;
    this.velocityY *= SPEED_DAMPING;
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.parentX = parentX;
    this.parentY = parentY;
    this.parentSize = parentSize;
  }
  
  draw(ctx) {
    this.drawCircle(ctx);
  }

  drawCircle(ctx) {
    ctx.fillStyle = this.colorPrefix + this.opacity.toFixed(2) + ')';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEdge(ctx, particle) {
    if (particle === null) return;
    ctx.strokeStyle = LINE_COLOR;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(particle.x, particle.y);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.animationFrame = null;
    this.time = 0;
    this.mouse = { x: -1000, y: -1000 };
    this.mouseClick = false;
    this.scale = 1;
    this.lastProgress = '';
    this.initialized = false;
    this.lastCenterX = 0;
    this.lastCenterY = 0;
    
    this.init();
  }

  init() {
    this.ctx.globalCompositeOperation = 'source-over';
    this.setupEventListeners();
    this.resize();
    this.animate();
  }

  setupEventListeners() {
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        this.mouse.x = x;
        this.mouse.y = y;
      } else {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
      }
    });

    window.addEventListener('mousedown', () => {
      this.mouseClick = true;
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resize(), 150);
    }, { passive: true });
  }

  resize() {
    const hero = this.canvas.parentElement;
    if (!hero) return;
    
    const oldCenterX = this.canvas.width / 2;
    const oldCenterY = this.canvas.height / 2;
    
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    if (!this.initialized) {
      this.createParticles(width, height);
      this.initialized = true;
      this.lastCenterX = width / 2;
      this.lastCenterY = height / 2;
    } else {
      this.updateScale(oldCenterX, oldCenterY);
      this.lastCenterX = width / 2;
      this.lastCenterY = height / 2;
    }
  }

  scaleCoefficient(nodesCount) {
    if (nodesCount === 0) return 1.0;
    return Math.min(1, 12 / Math.sqrt(nodesCount));
  }

  updateScale(oldCenterX, oldCenterY) {
    const nonEmptyCourses = Object.entries(courseProgress)
      .filter(([_, progress]) => progress > 0);

    let nodesCount = nonEmptyCourses.reduce((sum, [_, progress]) => sum + progress, 0);
    const fakeNodesCount = Math.max(0, 50 - nodesCount);
    nodesCount += fakeNodesCount;
    
    const newScale = this.scaleCoefficient(nodesCount);
    const scaleRatio = newScale / this.scale;
    this.scale = newScale;

    const newCenterX = this.canvas.width / 2;
    const newCenterY = this.canvas.height / 2;

    this.particles.forEach(particle => {
      particle.baseSize *= scaleRatio;
      particle.size = particle.baseSize;
      
      const offsetX = particle.x - oldCenterX;
      const offsetY = particle.y - oldCenterY;
      
      particle.x = newCenterX + offsetX;
      particle.y = newCenterY + offsetY;
    });
  }

  createParticles(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const particles = [];

    const nodesCount = Object.entries(courseProgress).reduce((sum, [_, progress]) =>
      sum + progress == 0 ? EMPTY_COURSE_NODES_COUNT : progress, 0);

    this.scale = this.scaleCoefficient(nodesCount);

    Object.entries(courseProgress).forEach(([courseId, progress], index) => {
      if(courses[courseId].comingSoon)
        return;

      const count = progress == 0 ? EMPTY_COURSE_NODES_COUNT : progress;
      let colorPrefix = "rgba(230,230,230,";

      const getColor = progress == 0
        ? () => colorPrefix
        : () => {
          const colorKey = courseColorMap[courseId];
          const config = courseColorConfigs[colorKey];
          return config.particles[Math.floor(Math.random() * config.particles.length)];
        };

      if (progress > 0) {
        const colorKey = courseColorMap[courseId];
        const config = courseColorConfigs[colorKey];
        colorPrefix = config.particles[Math.floor(Math.random() * config.particles.length)];
      }
      
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 30;
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      const courseParticle = new Particle(x, y, 3 * NODE_SIZE * this.scale, colorPrefix, 1, -1, index);
      particles.push(courseParticle);
      const courseParticleIndex = particles.length - 1;
      
      // Create progress particles
      for (let i = 0; i < count; i++) {
        const colorPrefix = getColor();
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100;
        const x = courseParticle.x + Math.cos(angle) * distance;
        const y = courseParticle.y + Math.sin(angle) * distance;
        const particle = new Particle(x, y, NODE_SIZE * this.scale, colorPrefix, 1, courseParticleIndex, index);
        particles.push(particle);
      }
    });
    
    this.particles = particles;
  }

  animate() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.time += 1;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    if (width === 0 || height === 0) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
      return;
    }

    this.ctx.clearRect(0, 0, width, height);
    
    const particles = this.particles;
    const mouse = this.mouse;
    let repulsionForce = 3;
    let repulsionRadius = 80;
    
    if (this.mouseClick) {
      repulsionRadius = 160;
      repulsionForce = 40;
      this.mouseClick = false;
    }

    const basePadding = NODES_DISTANCE * this.scale;
    const gridSize = NODE_SIZE * 6 * this.scale + basePadding * 3;
    const gridSizeInv = 1 / gridSize;
    const grid = new Map();

    const posHash = (x, y) => x * 1e9 + y;

    // Build spatial grid
    particles.forEach((particle, index) => {
      const gridX = Math.floor(particle.x * gridSizeInv);
      const gridY = Math.floor(particle.y * gridSizeInv);
      const pos = posHash(gridX, gridY);
      if (!grid.has(pos)) {
        grid.set(pos, [index]);
      } else {
        grid.get(pos).push(index);
      }
    });

    // Update particles
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      let fx = 0;
      let fy = 0;
      
      // Attraction to center
      const attractionCoefficient = 0.0005;
      const targetX = centerX;
      const targetY = centerY;
      fx += attractionCoefficient * (targetX - particle.x);
      fy += attractionCoefficient * (targetY - particle.y);
      
      // Mouse repulsion
      const mouseDistance2 = (mouse.x - particle.x) ** 2 + (mouse.y - particle.y) ** 2;
      const mouseDistance = Math.sqrt(mouseDistance2);
      if (mouseDistance < repulsionRadius) {
        const force = repulsionForce * (repulsionRadius - mouseDistance) / repulsionRadius;
        fx += (particle.x - mouse.x) / mouseDistance * force;
        fy += (particle.y - mouse.y) / mouseDistance * force;
      }
      
      let drawCnt = 0;
      const gridX = Math.floor(particle.x * gridSizeInv);
      const gridY = Math.floor(particle.y * gridSizeInv);
      
      // Check neighboring grid cells
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const pos = posHash(gridX + dx, gridY + dy);
          if (!grid.has(pos)) continue;
          
          grid.get(pos).forEach(j => {
            if (i === j) return;
            
            const particle2 = particles[j];
            const dist2 = (particle.x - particle2.x) ** 2 + (particle.y - particle2.y) ** 2;
            const sameGroup = particle.group === particle2.group;
            const padding = basePadding * (sameGroup ? 1 : 3);
            let wantedDistance = padding + particle.size + particle2.size;
            
            // Repulsion between particles
            if (dist2 < wantedDistance ** 2) {
              const dist = Math.sqrt(dist2);
              const t = (wantedDistance - dist) / wantedDistance;
              const force = 6 * t;
              const relativeForce = (force * particle2.size) / (particle.size + particle2.size);
              fx += (particle.x - particle2.x) / dist * relativeForce;
              fy += (particle.y - particle2.y) / dist * relativeForce;
            }
            
            // Draw edges between same group particles
            if (sameGroup && drawCnt < 5 && dist2 < (wantedDistance + 1) ** 2) {
              particle.drawEdge(this.ctx, particle2);
              drawCnt++;
            }
          });
        }
      }
      
      particle.velocityX += fx;
      particle.velocityY += fy;
    }
    
    // Update particle positions
    particles.forEach(particle => {
      const parent = particle.parent === -1 ? null : particles[particle.parent];
      const parentX = parent ? parent.x : 0;
      const parentY = parent ? parent.y : 0;
      const parentSize = parent ? parent.size : 0;
      particle.update(this.time, parentX, parentY, parentSize);
    });
    
    // Draw particles
    particles.forEach(particle => particle.draw(this.ctx));
    
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  updateProgress(newProgress) {
    const progressKey = JSON.stringify(newProgress);
    if (progressKey === this.lastProgress) return;
    this.lastProgress = progressKey;
    
    Object.assign(courseProgress, newProgress);
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    if (width > 0 && height > 0 && !this.initialized) {
      this.createParticles(width, height);
      this.initialized = true;
    } else if (this.initialized) {
      this.createParticles(width, height);
    }
  }
}

// ============================================
// COURSE CARD RENDERING
// ============================================

function renderCourseCards() {
  const grid = document.getElementById('courses-grid');

  Object.entries(courses).forEach(([id, course]) => {
    const config = courseColorConfigs[course.color];
    // progress is now actual question count, not percentage (0-100)
    const progress = courseProgress[id] || 0;
    const progressPercentage = Math.round((progress / course.stats.lessons) * 100);
    
    const card = document.createElement('div');
    card.className = `course-card${course.comingSoon ? ' coming-soon' : ''}`;
    
    card.innerHTML = `
      <div class="card-header">
        <div class="course-icon" style="background: ${config.icon}">
          ${course.icon}
        </div>
        <div class="course-info">
          <h3>${course.name}</h3>
          <span class="course-level">${course.level}</span>
        </div>
      </div>
      
      <div class="card-body">
        <p class="course-description">${course.description}</p>
        
        <div class="course-progress">
          <div class="progress-label">
            <span>Progress</span>
            <span class="progress-percentage">${progress}/${course.stats.lessons}</span>
          </div>
          <div class="progress-bar-container">
            <div 
              class="progress-bar-fill"
              style="width: ${progressPercentage}%; background: ${config.button}"
            ></div>
          </div>
        </div>
        
        <div class="course-stats">
          <div class="stat">
            <div class="stat-value">${course.stats.lessons}</div>
            <div class="stat-label">Lessons</div>
          </div>
          <div class="stat">
            <div class="stat-value">${course.stats.duration}</div>
            <div class="stat-label">Duration</div>
          </div>
        </div>
        
        ${course.comingSoon
          ? '<span class="course-btn" style="background: #9ca3af">Coming Soon</span>'
          : `<a href="/course/view.php?id=${course.moodleId}" class="course-btn" style="background: ${config.button}">Start Learning</a>`
        }
      </div>
    `;
    
    grid.appendChild(card);
  });
}

// ============================================
// MOODLE API INTEGRATION
// ============================================

async function fetchMoodleProgress() {
  try {
    // Get all Moodle course IDs
    const moodleIds = Object.values(courses)
      .filter(c => c.moodleId !== null)
      .map(c => c.moodleId)
      .join(',');

    // Use questionprogress.php for exercise-level tracking
    const response = await fetch(`/local/questionprogress.php?courses=${moodleIds}`);
    const data = await response.json();

    console.log('🔍 API Response:', data);

    if (data.success && data.data) {
      // Map Moodle course data back to frontend course IDs
      Object.entries(courses).forEach(([id, course]) => {
        if (course.moodleId && data.data[course.moodleId]) {
          const moodleData = data.data[course.moodleId];
          // Update progress: number of questions answered correctly
          courseProgress[id] = moodleData.correct || 0;

          console.log(`📊 ${course.name}: ${moodleData.correct}/${moodleData.total} questions answered`);

          // Update course stats with actual total from Moodle if available
          if (moodleData.total > 0) {
            course.stats.lessons = moodleData.total;
          }
        }
      });

      console.log('✅ Course Progress:', courseProgress);
      console.log('🎨 Creating particles for:', Object.values(courseProgress).reduce((a,b) => a+b, 0), 'questions');

      // Re-render course cards with new progress
      updateCourseCardsProgress();
    }
  } catch (error) {
    console.error('❌ Failed to fetch Moodle progress:', error);
    // Keep default progress on error
  }
}

function updateCourseCardsProgress() {
  Object.entries(courses).forEach(([id, course]) => {
    const progress = courseProgress[id] || 0;
    const progressPercentage = Math.round((progress / course.stats.lessons) * 100);

    // Find the course card
    const cards = document.querySelectorAll('.course-card');
    const cardIndex = Object.keys(courses).indexOf(id);
    if (cardIndex >= 0 && cards[cardIndex]) {
      const card = cards[cardIndex];
      const progressLabel = card.querySelector('.progress-percentage');
      const progressBar = card.querySelector('.progress-bar-fill');

      if (progressLabel) {
        progressLabel.textContent = `${progress}/${course.stats.lessons}`;
      }
      if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
      }
    }
  });
}

// ============================================
// INITIALIZATION
// ============================================

let particleSystem;

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Page loaded! Starting initialization...');

  // Render course cards
  renderCourseCards();

  // Fetch real progress from Moodle (works for both logged-in and guest users)
  fetchMoodleProgress().then(() => {
    console.log('✅ Progress fetch completed!');

    // Initialize particle system
    particleSystem = new ParticleSystem('hero-canvas');
  });
});