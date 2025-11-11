// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
});

// 移动端菜单切换
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', function() {
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    navMenu.style.position = 'absolute';
    navMenu.style.top = '100%';
    navMenu.style.left = '0';
    navMenu.style.right = '0';
    navMenu.style.background = 'white';
    navMenu.style.flexDirection = 'column';
    navMenu.style.padding = '1rem';
    navMenu.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
});

// 平滑滚动到指定区域
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// 导航栏链接点击事件
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToSection(targetId);
        
        // 更新活动状态
        document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');
        
        // 关闭移动端菜单
        if (window.innerWidth <= 968) {
            navMenu.style.display = 'none';
        }
    });
});

// 宠物筛选功能
const filterButtons = document.querySelectorAll('.filter-btn');
const petCards = document.querySelectorAll('.pet-card');

filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // 更新按钮状态
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const filter = this.getAttribute('data-filter');
        
        // 筛选宠物卡片
        petCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.6s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// 搜索功能
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    petCards.forEach(card => {
        const petName = card.querySelector('h3').textContent.toLowerCase();
        const petDescription = card.querySelector('.pet-description').textContent.toLowerCase();
        
        if (petName.includes(searchTerm) || petDescription.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.6s ease';
        } else {
            card.style.display = 'none';
        }
    });
    
    // 如果搜索框为空，显示所有符合当前筛选条件的卡片
    if (searchTerm === '') {
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        petCards.forEach(card => {
            if (activeFilter === 'all' || card.getAttribute('data-category') === activeFilter) {
                card.style.display = 'block';
            }
        });
    }
});

// 模态框功能
const modal = document.getElementById('adoptModal');

function openModal(button) {
    // 获取宠物信息
    const petCard = button.closest('.pet-card');
    const petName = petCard.querySelector('h3').textContent;
    
    // 更新模态框标题（可选）
    modal.querySelector('h2').innerHTML = `<i class="fas fa-heart"></i> 领养申请 - ${petName}`;
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 点击模态框外部关闭
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

// ESC键关闭模态框
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// 领养表单提交
document.getElementById('adoptForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 显示成功消息
    alert('感谢您的申请！我们会尽快与您联系。');
    
    // 重置表单
    this.reset();
    
    // 关闭模态框
    closeModal();
});

// 联系表单提交
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 显示成功消息
    alert('消息已发送！我们会尽快回复您。');
    
    // 重置表单
    this.reset();
});

// 捐赠按钮点击事件
document.querySelector('.donate-btn').addEventListener('click', function() {
    alert('感谢您的爱心！捐赠功能即将开放。');
});

// 宠物卡片入场动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease';
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

// 观察所有宠物卡片
petCards.forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// 数字动画效果
function animateNumber(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 30);
}

// 当统计数字进入视口时开始动画
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent.replace(/,/g, '');
                let target;
                
                if (text.includes('+')) {
                    target = parseInt(text);
                    stat.textContent = '0+';
                } else {
                    target = parseInt(text);
                    stat.textContent = '0';
                }
                
                animateNumber(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// 流程步骤动画
const steps = document.querySelectorAll('.step');
const stepsObserver = new IntersectionObserver(function(entries) {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.animation = 'fadeInUp 0.6s ease';
                entry.target.style.opacity = '1';
            }, index * 100);
        }
    });
}, { threshold: 0.2 });

steps.forEach(step => {
    step.style.opacity = '0';
    stepsObserver.observe(step);
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有URL锚点
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        setTimeout(() => {
            scrollToSection(targetId);
        }, 100);
    }
    
    // 为所有按钮添加点击反馈
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
});

// 懒加载图片
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// 添加页面滚动进度条
const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
    z-index: 9999;
    transition: width 0.2s;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', function() {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
});

// 回到顶部按钮
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff6b6b, #ff8787);
    color: white;
    border: none;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    transition: all 0.3s;
`;
document.body.appendChild(backToTopButton);

window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
        backToTopButton.style.display = 'flex';
    } else {
        backToTopButton.style.display = 'none';
    }
});

backToTopButton.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

backToTopButton.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px)';
    this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
});

backToTopButton.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
});

console.log('🐾 爱宠之家宠物领养平台已加载完成！');

