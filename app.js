// ============ KARTO MESSENGER APP ============

const App = {
    currentUser: null,
    chats: [],
    contacts: [],
    calls: [],
    activeChat: null,
    themes: ['dark','light','purple','blue','green','red'],
    currentTheme: 'dark',
    accentColor: '#5865F2',

    // Emojis
    emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','🥴','😠','😡','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🤚','🖐️','🖖','👋','🤏','💪','🔥','⭐','🌟','💫','✨','💥','💢','💦','💨','🎉','🎊','🎈','🎁','🏆','🥇','🎯','🎮','🎲','🎭','🎨','🎬','🎤','🎧','🎵','🎶','💯','✅','❌','⭕','❗','❓','💡','💰','📱','💻','🖥️','📷','📹','🔔','🔇','📢','👑','💎','🌈','☀️','🌙','⚡','🌊','🍕','🍔','🍟','🌮','🍩','🍪','🎂','🍰','☕','🍺','🍷'],

    init() {
        this.loadData();
        this.setupSplash();
        this.setupAuth();
        this.setupMessenger();
        this.setupModals();
        this.setupEmoji();
        this.setupCall();
    },

    // ============ DATA ============
    loadData() {
        const data = localStorage.getItem('karto_data');
        if (data) {
            const parsed = JSON.parse(data);
            this.currentUser = parsed.currentUser || null;
            this.chats = parsed.chats || [];
            this.contacts = parsed.contacts || [];
            this.calls = parsed.calls || [];
            this.currentTheme = parsed.currentTheme || 'dark';
            this.accentColor = parsed.accentColor || '#5865F2';
        }
        const users = localStorage.getItem('karto_users');
        if (!users) {
            localStorage.setItem('karto_users', JSON.stringify([]));
        }
        this.applyTheme(this.currentTheme);
        this.applyAccent(this.accentColor);
    },

    saveData() {
        localStorage.setItem('karto_data', JSON.stringify({
            currentUser: this.currentUser,
            chats: this.chats,
            contacts: this.contacts,
            calls: this.calls,
            currentTheme: this.currentTheme,
            accentColor: this.accentColor
        }));
    },

    getUsers() {
        return JSON.parse(localStorage.getItem('karto_users') || '[]');
    },

    saveUsers(users) {
        localStorage.setItem('karto_users', JSON.stringify(users));
    },

    // ============ SPLASH ============
    setupSplash() {
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            splash.classList.add('hidden');
            if (this.currentUser) {
                this.showMessenger();
            } else {
                const users = this.getUsers();
                if (users.length > 0) {
                    document.getElementById('login-screen').classList.remove('hidden');
                } else {
                    document.getElementById('reg-step1').classList.remove('hidden');
                }
            }
        }, 3000);
    },

    // ============ AUTH ============
    setupAuth() {
        const regData = { nickname: '', id: '', phone: '', password: '' };

        // Step 1: Nickname
        document.getElementById('btn-step1').onclick = () => {
            const nick = document.getElementById('reg-nickname').value.trim();
            if (nick.length < 2) {
                document.getElementById('nick-error').textContent = 'Минимум 2 символа';
                return;
            }
            if (nick.length > 20) {
                document.getElementById('nick-error').textContent = 'Максимум 20 символов';
                return;
            }
            regData.nickname = nick;
            document.getElementById('nick-error').textContent = '';
            this.switchScreen('reg-step1', 'reg-step2');
        };

        // Step 2: ID
        document.getElementById('btn-step2').onclick = () => {
            const id = document.getElementById('reg-id').value.trim();
            if (!id.includes('#') || id.length < 3) {
                document.getElementById('id-error').textContent = 'Формат: имя#1234';
                return;
            }
            const users = this.getUsers();
            if (users.find(u => u.id === id)) {
                document.getElementById('id-error').textContent = 'Этот ID уже занят';
                return;
            }
            regData.id = id;
            document.getElementById('id-error').textContent = '';
            this.switchScreen('reg-step2', 'reg-step3');
        };

        document.getElementById('btn-back2').onclick = () => {
            this.switchScreen('reg-step2', 'reg-step1');
        };

        // Step 3: Phone
        document.getElementById('btn-step3').onclick = () => {
            const phone = document.getElementById('reg-phone').value.trim();
            if (phone.length < 6) {
                document.getElementById('phone-error').textContent = 'Введите корректный номер';
                return;
            }
            regData.phone = phone;
            document.getElementById('phone-error').textContent = '';
            this.switchScreen('reg-step3', 'reg-step4');
        };

        document.getElementById('btn-back3').onclick = () => {
            this.switchScreen('reg-step3', 'reg-step2');
        };

        // Step 4: Password
        const passInput = document.getElementById('reg-password');
        passInput.addEventListener('input', () => {
            const strength = this.getPasswordStrength(passInput.value);
            const bar = document.getElementById('strength-bar');
            bar.style.width = strength.percent + '%';
            bar.style.background = strength.color;
        });

        document.getElementById('btn-register').onclick = () => {
            const pass = document.getElementById('reg-password').value;
            const pass2 = document.getElementById('reg-password2').value;
            if (pass.length < 6) {
                document.getElementById('pass-error').textContent = 'Минимум 6 символов';
                return;
            }
            if (pass !== pass2) {
                document.getElementById('pass-error').textContent = 'Пароли не совпадают';
                return;
            }
            regData.password = pass;
            document.getElementById('pass-error').textContent = '';

            // Register user
            const users = this.getUsers();
            const newUser = {
                id: regData.id,
                nickname: regData.nickname,
                phone: regData.phone,
                password: regData.password,
                avatar: '',
                bio: '',
                createdAt: Date.now()
            };
            users.push(newUser);
            this.saveUsers(users);

            this.currentUser = newUser;
            this.chats = [];
            this.contacts = [];
            this.calls = [];
            this.saveData();

            this.notify('Аккаунт создан! Добро пожаловать!', 'success');
            this.switchScreen('reg-step4', null);
            this.showMessenger();
        };

        document.getElementById('btn-back4').onclick = () => {
            this.switchScreen('reg-step4', 'reg-step3');
        };

        // Toggle password
        document.getElementById('toggle-pass1').onclick = () => this.togglePassword('reg-password', 'toggle-pass1');
        document.getElementById('toggle-pass2').onclick = () => this.togglePassword('reg-password2', 'toggle-pass2');
        document.getElementById('toggle-pass-login').onclick = () => this.togglePassword('login-password', 'toggle-pass-login');

        // Login
        document.getElementById('btn-login').onclick = () => {
            const id = document.getElementById('login-id').value.trim();
            const pass = document.getElementById('login-password').value;
            const users = this.getUsers();
            const user = users.find(u => u.id === id && u.password === pass);
            if (!user) {
                document.getElementById('login-error').textContent = 'Неверный ID или пароль';
                return;
            }
            document.getElementById('login-error').textContent = '';
            this.currentUser = user;

            // Load user-specific data
            const userData = localStorage.getItem('karto_userdata_' + user.id);
            if (userData) {
                const parsed = JSON.parse(userData);
                this.chats = parsed.chats || [];
                this.contacts = parsed.contacts || [];
                this.calls = parsed.calls || [];
            } else {
                this.chats = [];
                this.contacts = [];
                this.calls = [];
            }
            this.saveData();
            this.notify('С возвращением, ' + user.nickname + '!', 'success');
            this.switchScreen('login-screen', null);
            this.showMessenger();
        };

        // Switch screens
        document.getElementById('go-login-1').onclick = (e) => {
            e.preventDefault();
            this.switchScreen('reg-step1', 'login-screen');
        };
        document.getElementById('go-register').onclick = (e) => {
            e.preventDefault();
            this.switchScreen('login-screen', 'reg-step1');
        };
    },

    switchScreen(from, to) {
        if (from) document.getElementById(from).classList.add('hidden');
        if (to) {
            document.getElementById(to).classList.remove('hidden');
            document.getElementById(to).style.animation = 'none';
            document.getElementById(to).offsetHeight;
            document.getElementById(to).style.animation = '';
        }
    },

    togglePassword(inputId, btnId) {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        if (input.type === 'password') {
            input.type = 'text';
            btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            input.type = 'password';
            btn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    },

    getPasswordStrength(pass) {
        let score = 0;
        if (pass.length >= 6) score++;
        if (pass.length >= 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        const levels = [
            { percent: 0, color: '#ed4245' },
            { percent: 20, color: '#ed4245' },
            { percent: 40, color: '#fee75c' },
            { percent: 60, color: '#fee75c' },
            { percent: 80, color: '#3ba55d' },
            { percent: 100, color: '#3ba55d' }
        ];
        return levels[score] || levels[0];
    },

    // ============ MESSENGER ============
    showMessenger() {
        document.getElementById('messenger').classList.remove('hidden');
        this.updateProfile();
        this.renderChats();
        this.renderContacts();
        this.renderCalls();
    },

    setupMessenger() {
        // Nav tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                document.getElementById(tab + '-list').classList.add('active');
            };
        });

        // New chat button
        document.getElementById('btn-new-chat').onclick = () => this.openModal('modal-add-friend');
        document.getElementById('welcome-new-chat').onclick = () => this.openModal('modal-add-friend');

        // Create group
        document.getElementById('btn-create-group').onclick = () => {
            this.populateGroupMembers();
            this.openModal('modal-create-group');
        };

        // Settings
        document.getElementById('btn-settings').onclick = () => {
            this.populateSettings();
            this.openModal('modal-settings');
        };

        // Send message
        document.getElementById('btn-send').onclick = () => this.sendMessage();
        document.getElementById('message-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        document.getElementById('message-input').addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // Back button mobile
        document.getElementById('btn-back-chat').onclick = () => {
            document.getElementById('sidebar').classList.remove('chat-open');
            document.getElementById('main-area').classList.remove('chat-open');
            this.activeChat = null;
        };

        // Chat header actions
        document.getElementById('btn-voice-call').onclick = () => {
            if (this.activeChat) this.startCall(this.activeChat, false);
        };
        document.getElementById('btn-video-call').onclick = () => {
            if (this.activeChat) this.startCall(this.activeChat, true);
        };
        document.getElementById('btn-chat-info').onclick = () => {
            if (this.activeChat) this.showUserProfile(this.activeChat);
        };

        // Attach
        document.getElementById('btn-attach').onclick = () => this.openModal('modal-attach');
        document.getElementById('attach-photo-input').onchange = (e) => this.handleFileAttach(e, 'image');
        document.getElementById('attach-video-input').onchange = (e) => this.handleFileAttach(e, 'video');
        document.getElementById('attach-file-input').onchange = (e) => this.handleFileAttach(e, 'file');

        // GIF
        document.getElementById('btn-gif').onclick = () => this.openModal('modal-gif');
        let gifTimeout;
        document.getElementById('gif-search').addEventListener('input', (e) => {
            clearTimeout(gifTimeout);
            gifTimeout = setTimeout(() => this.searchGifs(e.target.value), 500);
        });

        // Emoji
        document.getElementById('btn-emoji').onclick = (e) => {
            e.stopPropagation();
            document.getElementById('emoji-picker').classList.toggle('hidden');
        };
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#emoji-picker') && !e.target.closest('#btn-emoji')) {
                document.getElementById('emoji-picker').classList.add('hidden');
            }
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterChats(e.target.value);
        });
    },

    updateProfile() {
        if (!this.currentUser) return;
        document.getElementById('my-name').textContent = this.currentUser.nickname;
        document.getElementById('my-id-display').textContent = this.currentUser.id;
        const placeholder = document.getElementById('my-avatar-placeholder');
        const img = document.getElementById('my-avatar-img');
        placeholder.textContent = this.currentUser.nickname.charAt(0).toUpperCase();
        if (this.currentUser.avatar) {
            img.src = this.currentUser.avatar;
            img.classList.remove('hidden');
            placeholder.classList.add('hidden');
        } else {
            img.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }
    },

    // ============ CHATS ============
    renderChats() {
        const list = document.getElementById('chats-list');
        const empty = document.getElementById('empty-chats');

        // Remove old items
        list.querySelectorAll('.chat-item').forEach(el => el.remove());

        if (this.chats.length === 0) {
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        this.chats.forEach(chat => {
            const el = document.createElement('div');
            el.className = 'chat-item' + (this.activeChat && this.activeChat.id === chat.id ? ' active' : '');
            el.dataset.chatId = chat.id;

            const lastMsg = chat.messages && chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1]
                : null;
            const lastText = lastMsg
                ? (lastMsg.type === 'text' ? lastMsg.text : lastMsg.type === 'image' ? '📷 Фото' : lastMsg.type === 'video' ? '🎥 Видео' : lastMsg.type === 'gif' ? 'GIF' : lastMsg.type === 'file' ? '📎 Файл' : '')
                : 'Нет сообщений';
            const lastTime = lastMsg ? this.formatTime(lastMsg.timestamp) : '';

            const avatarHtml = chat.avatar
                ? `<img src="${chat.avatar}" alt="">`
                : `<div class="avatar-placeholder">${(chat.name || 'U').charAt(0).toUpperCase()}</div>`;

            el.innerHTML = `
                <div class="chat-item-avatar">${avatarHtml}</div>
                <div class="chat-item-info">
                    <div class="chat-item-top">
                        <span class="chat-item-name">${this.escapeHtml(chat.name)}</span>
                        <span class="chat-item-time">${lastTime}</span>
                    </div>
                    <div class="chat-item-bottom">
                        <span class="chat-item-msg">${this.escapeHtml(lastText)}</span>
                        ${chat.unread ? `<div class="chat-item-unread">${chat.unread}</div>` : ''}
                    </div>
                </div>
            `;

            el.onclick = () => this.openChat(chat);
            list.appendChild(el);
        });
    },

    openChat(chat) {
        this.activeChat = chat;
        chat.unread = 0;
        this.saveData();

        // Mobile
        document.getElementById('sidebar').classList.add('chat-open');
        document.getElementById('main-area').classList.add('chat-open');

        // Update header
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('chat-area').classList.remove('hidden');
        document.getElementById('chat-name').textContent = chat.name;
        document.getElementById('chat-status').textContent = chat.isGroup ? `${(chat.members||[]).length} участников` : 'Онлайн';

        const headerAvatar = document.getElementById('chat-avatar');
        if (chat.avatar) {
            headerAvatar.innerHTML = `<img src="${chat.avatar}" alt="">`;
        } else {
            headerAvatar.innerHTML = `<div class="avatar-placeholder">${(chat.name||'U').charAt(0).toUpperCase()}</div>`;
        }

        this.renderMessages(chat);
        this.renderChats();

        // Scroll down
        const msgsEl = document.getElementById('chat-messages');
        setTimeout(() => msgsEl.scrollTop = msgsEl.scrollHeight, 100);
    },

    renderMessages(chat) {
        const container = document.getElementById('chat-messages');
        container.innerHTML = '';

        if (!chat.messages || chat.messages.length === 0) {
            container.innerHTML = '<div class="system-message">Начните общение!</div>';
            return;
        }

        let lastDate = '';
        chat.messages.forEach(msg => {
            const msgDate = new Date(msg.timestamp).toLocaleDateString('ru');
            if (msgDate !== lastDate) {
                lastDate = msgDate;
                const dateEl = document.createElement('div');
                dateEl.className = 'system-message';
                dateEl.textContent = msgDate;
                container.appendChild(dateEl);
            }

            const el = document.createElement('div');
            const isOwn = msg.senderId === (this.currentUser ? this.currentUser.id : '');
            el.className = 'message ' + (isOwn ? 'own' : 'other');

            let content = '';

            if (!isOwn && chat.isGroup) {
                content += `<div class="message-sender">${this.escapeHtml(msg.senderName || 'User')}</div>`;
            }

            if (msg.type === 'text') {
                content += `<div>${this.escapeHtml(msg.text)}</div>`;
            } else if (msg.type === 'image') {
                content += `<div class="message-media"><img src="${msg.url}" alt="Фото" loading="lazy"></div>`;
            } else if (msg.type === 'video') {
                content += `<div class="message-media"><video src="${msg.url}" controls></video></div>`;
            } else if (msg.type === 'gif') {
                content += `<div class="message-gif"><img src="${msg.url}" alt="GIF" loading="lazy"></div>`;
            } else if (msg.type === 'file') {
                content += `<div class="message-file">
                    <i class="fas fa-file"></i>
                    <div class="message-file-info">
                        <div class="message-file-name">${this.escapeHtml(msg.fileName || 'Файл')}</div>
                        <div class="message-file-size">${msg.fileSize || ''}</div>
                    </div>
                </div>`;
            }

            content += `<div class="message-time">${this.formatTime(msg.timestamp)}</div>`;
            el.innerHTML = content;
            container.appendChild(el);
        });

        setTimeout(() => container.scrollTop = container.scrollHeight, 50);
    },

    sendMessage() {
        if (!this.activeChat) return;
        const input = document.getElementById('message-input');
        const text = input.value.trim();
        if (!text) return;

        if (!this.activeChat.messages) this.activeChat.messages = [];
        this.activeChat.messages.push({
            id: Date.now(),
            senderId: this.currentUser.id,
            senderName: this.currentUser.nickname,
            type: 'text',
            text: text,
            timestamp: Date.now()
        });

        input.value = '';
        input.style.height = 'auto';
        this.saveData();
        this.renderMessages(this.activeChat);
        this.renderChats();

        // Simulate reply after 1-3 seconds
        if (!this.activeChat.isGroup) {
            setTimeout(() => {
                this.simulateReply(this.activeChat);
            }, 1000 + Math.random() * 2000);
        }
    },

    simulateReply(chat) {
        if (!chat || this.activeChat !== chat) return;

        const replies = [
            'Привет! Как дела? 😊',
            'Окей, понял',
            'Интересно! 🤔',
            'Хахах 😂',
            'Круто!',
            'Согласен 👍',
            'А что потом?',
            'Давай! 🔥',
            'Ладно, пиши',
            'Хорошо 👌',
            'Оу, серьёзно?',
            'Не, ну ты даёшь',
            'Я думал об этом',
            'Отлично!',
            'Норм 😎'
        ];

        if (!chat.messages) chat.messages = [];
        chat.messages.push({
            id: Date.now(),
            senderId: chat.contactId || 'other',
            senderName: chat.name,
            type: 'text',
            text: replies[Math.floor(Math.random() * replies.length)],
            timestamp: Date.now()
        });

        this.saveData();
        if (this.activeChat && this.activeChat.id === chat.id) {
            this.renderMessages(chat);
        }
        this.renderChats();
    },

    // ============ CONTACTS ============
    renderContacts() {
        const list = document.getElementById('contacts-list');
        const empty = document.getElementById('empty-contacts');
        list.querySelectorAll('.chat-item').forEach(el => el.remove());

        if (this.contacts.length === 0) {
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        this.contacts.forEach(contact => {
            const el = document.createElement('div');
            el.className = 'chat-item';

            const avatarHtml = contact.avatar
                ? `<img src="${contact.avatar}" alt="">`
                : `<div class="avatar-placeholder">${(contact.nickname||'U').charAt(0).toUpperCase()}</div>`;

            el.innerHTML = `
                <div class="chat-item-avatar">${avatarHtml}</div>
                <div class="chat-item-info">
                    <div class="chat-item-top">
                        <span class="chat-item-name">${this.escapeHtml(contact.nickname)}</span>
                    </div>
                    <div class="chat-item-bottom">
                        <span class="chat-item-msg">${this.escapeHtml(contact.id)}</span>
                    </div>
                </div>
            `;

            el.onclick = () => {
                // Open or create chat
                let chat = this.chats.find(c => c.contactId === contact.id && !c.isGroup);
                if (!chat) {
                    chat = {
                        id: 'chat_' + Date.now(),
                        name: contact.nickname,
                        contactId: contact.id,
                        avatar: contact.avatar || '',
                        isGroup: false,
                        messages: [],
                        unread: 0
                    };
                    this.chats.unshift(chat);
                    this.saveData();
                    this.renderChats();
                }
                this.openChat(chat);
                // Switch to chats tab
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('[data-tab="chats"]').classList.add('active');
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                document.getElementById('chats-list').classList.add('active');
            };

            list.appendChild(el);
        });
    },

    // ============ CALLS ============
    renderCalls() {
        const list = document.getElementById('calls-list');
        const empty = document.getElementById('empty-calls');
        list.querySelectorAll('.call-item').forEach(el => el.remove());

        if (this.calls.length === 0) {
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        this.calls.forEach(call => {
            const el = document.createElement('div');
            el.className = 'call-item';

            const avatarHtml = `<div class="avatar-placeholder">${(call.name||'U').charAt(0).toUpperCase()}</div>`;
            const isMissed = call.status === 'missed';
            const icon = call.isVideo ? 'fa-video' : 'fa-phone-alt';
            const dirIcon = call.direction === 'outgoing' ? 'fa-arrow-up' : 'fa-arrow-down';

            el.innerHTML = `
                <div class="chat-item-avatar">${avatarHtml}</div>
                <div class="call-item-info">
                    <span class="call-item-name" style="${isMissed ? 'color:var(--danger)' : ''}">${this.escapeHtml(call.name)}</span>
                    <span class="call-item-detail ${isMissed ? 'missed' : ''}">
                        <i class="fas ${dirIcon}"></i>
                        <i class="fas ${icon}"></i>
                        ${this.formatTime(call.timestamp)} ${call.duration ? '· ' + call.duration : ''}
                        ${isMissed ? '· Пропущенный' : ''}
                    </span>
                </div>
                <div class="call-item-action">
                    <button class="icon-btn"><i class="fas fa-phone-alt"></i></button>
                </div>
            `;

            el.querySelector('.call-item-action .icon-btn').onclick = (e) => {
                e.stopPropagation();
                this.startCall({ name: call.name, contactId: call.contactId }, call.isVideo);
            };

            list.appendChild(el);
        });
    },

    // ============ MODALS ============
    setupModals() {
        // Close modals
        document.querySelectorAll('.modal-close, .modal-cancel, .modal-overlay').forEach(el => {
            el.onclick = function() {
                this.closest('.modal').classList.add('hidden');
            };
        });
        // Don't close on content click
        document.querySelectorAll('.modal-content').forEach(el => {
            el.onclick = (e) => e.stopPropagation();
        });

        // Add friend
        document.getElementById('btn-add-friend-confirm').onclick = () => {
            const id = document.getElementById('add-friend-id').value.trim();
            if (!id) {
                document.getElementById('add-friend-error').textContent = 'Введите ID';
                return;
            }
            if (id === this.currentUser.id) {
                document.getElementById('add-friend-error').textContent = 'Нельзя добавить себя';
                return;
            }
            const users = this.getUsers();
            const user = users.find(u => u.id === id);

            // Allow adding even if user not found (simulate)
            if (this.contacts.find(c => c.id === id)) {
                document.getElementById('add-friend-error').textContent = 'Уже в контактах';
                return;
            }

            const contact = user ? {
                id: user.id,
                nickname: user.nickname,
                avatar: user.avatar || '',
                bio: user.bio || ''
            } : {
                id: id,
                nickname: id.split('#')[0],
                avatar: '',
                bio: ''
            };

            this.contacts.push(contact);

            // Auto-create chat
            const chat = {
                id: 'chat_' + Date.now(),
                name: contact.nickname,
                contactId: contact.id,
                avatar: contact.avatar,
                isGroup: false,
                messages: [],
                unread: 0
            };
            this.chats.unshift(chat);
            this.saveData();
            this.renderChats();
            this.renderContacts();

            document.getElementById('add-friend-error').textContent = '';
            const successEl = document.getElementById('add-friend-success');
            successEl.textContent = `${contact.nickname} добавлен!`;
            successEl.classList.remove('hidden');
            document.getElementById('add-friend-id').value = '';

            setTimeout(() => {
                successEl.classList.add('hidden');
                document.getElementById('modal-add-friend').classList.add('hidden');
            }, 1500);

            this.notify(contact.nickname + ' добавлен в контакты!', 'success');
        };

        // Create group
        document.getElementById('group-photo-upload').onclick = () => {
            document.getElementById('group-photo-input').click();
        };

        document.getElementById('group-photo-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const preview = document.getElementById('group-photo-preview');
                    preview.src = ev.target.result;
                    preview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        };

        document.getElementById('btn-create-group-confirm').onclick = () => {
            const name = document.getElementById('group-name-input').value.trim();
            if (!name) {
                this.notify('Введите название группы', 'error');
                return;
            }

            const preview = document.getElementById('group-photo-preview');
            const avatar = preview.classList.contains('hidden') ? '' : preview.src;

            const selectedMembers = [];
            document.querySelectorAll('.member-option.selected').forEach(el => {
                selectedMembers.push({
                    id: el.dataset.id,
                    nickname: el.dataset.name
                });
            });

            const group = {
                id: 'group_' + Date.now(),
                name: name,
                avatar: avatar,
                isGroup: true,
                members: [
                    { id: this.currentUser.id, nickname: this.currentUser.nickname },
                    ...selectedMembers
                ],
                messages: [{
                    id: Date.now(),
                    senderId: 'system',
                    type: 'text',
                    text: `Группа "${name}" создана`,
                    timestamp: Date.now()
                }],
                unread: 0
            };

            this.chats.unshift(group);
            this.saveData();
            this.renderChats();
            document.getElementById('modal-create-group').classList.add('hidden');
            document.getElementById('group-name-input').value = '';
            preview.classList.add('hidden');
            this.notify('Группа "' + name + '" создана!', 'success');
            this.openChat(group);
        };

        // Settings
        document.getElementById('profile-photo-edit').onclick = () => {
            document.getElementById('profile-photo-input').click();
        };

        document.getElementById('profile-photo-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.currentUser.avatar = ev.target.result;
                    // Update in users list too
                    const users = this.getUsers();
                    const user = users.find(u => u.id === this.currentUser.id);
                    if (user) user.avatar = ev.target.result;
                    this.saveUsers(users);
                    this.saveData();
                    this.updateProfile();
                    this.populateSettings();
                    this.notify('Фото обновлено!', 'success');
                };
                reader.readAsDataURL(file);
            }
        };

        document.getElementById('btn-save-profile').onclick = () => {
            const nick = document.getElementById('settings-nickname').value.trim();
            const bio = document.getElementById('settings-bio').value.trim();

            if (nick.length >= 2) {
                this.currentUser.nickname = nick;
            }
            this.currentUser.bio = bio;

            const users = this.getUsers();
            const user = users.find(u => u.id === this.currentUser.id);
            if (user) {
                user.nickname = this.currentUser.nickname;
                user.bio = this.currentUser.bio;
                this.saveUsers(users);
            }
            this.saveData();
            this.updateProfile();
            this.notify('Профиль сохранён!', 'success');
        };

        document.getElementById('copy-id-btn').onclick = () => {
            navigator.clipboard.writeText(this.currentUser.id).then(() => {
                this.notify('ID скопирован!', 'info');
            });
        };

        // Theme
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.onclick = () => {
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                this.applyTheme(opt.dataset.theme);
            };
        });

        // Accent
        document.querySelectorAll('.accent-option').forEach(opt => {
            opt.onclick = () => {
                document.querySelectorAll('.accent-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                this.applyAccent(opt.dataset.accent);
            };
        });

        // Logout
        document.getElementById('btn-logout').onclick = () => {
            // Save user data before logout
            if (this.currentUser) {
                localStorage.setItem('karto_userdata_' + this.currentUser.id, JSON.stringify({
                    chats: this.chats,
                    contacts: this.contacts,
                    calls: this.calls
                }));
            }
            this.currentUser = null;
            this.chats = [];
            this.contacts = [];
            this.activeChat = null;
            this.saveData();
            document.getElementById('modal-settings').classList.add('hidden');
            document.getElementById('messenger').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
            this.notify('Вы вышли из аккаунта', 'info');
        };
    },

    openModal(id) {
        document.getElementById(id).classList.remove('hidden');
    },

    populateSettings() {
        document.getElementById('settings-nickname').value = this.currentUser.nickname;
        document.getElementById('settings-bio').value = this.currentUser.bio || '';
        document.getElementById('settings-id').value = this.currentUser.id;

        const placeholder = document.getElementById('settings-avatar-placeholder');
        const img = document.getElementById('settings-avatar-img');
        placeholder.textContent = this.currentUser.nickname.charAt(0).toUpperCase();

        if (this.currentUser.avatar) {
            img.src = this.currentUser.avatar;
            img.classList.remove('hidden');
            placeholder.classList.add('hidden');
        } else {
            img.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }

        // Theme
        document.querySelectorAll('.theme-option').forEach(o => {
            o.classList.toggle('active', o.dataset.theme === this.currentTheme);
        });
    },

    populateGroupMembers() {
        const container = document.getElementById('members-select');
        container.innerHTML = '';

        if (this.contacts.length === 0) {
            container.innerHTML = '<p class="no-contacts-msg">Добавьте контакты чтобы приглашать в группу</p>';
            return;
        }

        this.contacts.forEach(contact => {
            const el = document.createElement('div');
            el.className = 'member-option';
            el.dataset.id = contact.id;
            el.dataset.name = contact.nickname;

            const avatarHtml = contact.avatar
                ? `<img src="${contact.avatar}" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`
                : `<div class="avatar-placeholder" style="width:36px;height:36px;font-size:14px">${contact.nickname.charAt(0).toUpperCase()}</div>`;

            el.innerHTML = `
                <div class="checkbox"></div>
                ${avatarHtml}
                <span>${this.escapeHtml(contact.nickname)}</span>
            `;

            el.onclick = () => el.classList.toggle('selected');
            container.appendChild(el);
        });
    },

    applyTheme(theme) {
        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        this.saveData();
    },

    applyAccent(color) {
        this.accentColor = color;
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--msg-own', color);
        this.saveData();
    },

    // ============ FILE ATTACH ============
    handleFileAttach(e, type) {
        if (!this.activeChat) return;
        const file = e.target.files[0];
        if (!file) return;

        document.getElementById('modal-attach').classList.add('hidden');

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (!this.activeChat.messages) this.activeChat.messages = [];

            let msg = {
                id: Date.now(),
                senderId: this.currentUser.id,
                senderName: this.currentUser.nickname,
                timestamp: Date.now()
            };

            if (type === 'image') {
                msg.type = 'image';
                msg.url = ev.target.result;
            } else if (type === 'video') {
                msg.type = 'video';
                msg.url = ev.target.result;
            } else {
                msg.type = 'file';
                msg.url = ev.target.result;
                msg.fileName = file.name;
                msg.fileSize = this.formatFileSize(file.size);
            }

            this.activeChat.messages.push(msg);
            this.saveData();
            this.renderMessages(this.activeChat);
            this.renderChats();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    },

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    // ============ GIF ============
    searchGifs(query) {
        const grid = document.getElementById('gif-grid');
        if (!query.trim()) {
            grid.innerHTML = '<div class="gif-loading">Введите запрос для поиска GIF</div>';
            return;
        }

        grid.innerHTML = '<div class="gif-loading"><i class="fas fa-spinner fa-spin"></i> Загрузка...</div>';

        // Using Tenor API (free, no key needed for basic usage) or generate placeholder gifs
        // We'll use a free API approach with picsum/placeholder
        const gifs = [];
        const keywords = ['funny','cat','dog','reaction','dance','happy','sad','love','wow','cool','fire','yes','no','ok','hi','bye'];

        // Generate placeholder gifs based on query
        for (let i = 0; i < 12; i++) {
            gifs.push({
                url: `https://cataas.com/cat/gif?t=${Date.now()}_${i}_${query}`,
                preview: `https://cataas.com/cat/gif?t=${Date.now()}_${i}_${query}`
            });
        }

        // Also try giphy-like URLs
        grid.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const item = document.createElement('div');
            item.className = 'gif-item';
            // Use placeholder images that simulate gifs
            const seed = encodeURIComponent(query + i);
            item.innerHTML = `<img src="https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&size=200" alt="GIF" loading="lazy" onerror="this.src='https://via.placeholder.com/200x150/5865F2/ffffff?text=GIF'">`;
            item.onclick = () => this.sendGif(`https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&size=400`);
            grid.appendChild(item);
        }
    },

    sendGif(url) {
        if (!this.activeChat) return;
        if (!this.activeChat.messages) this.activeChat.messages = [];

        this.activeChat.messages.push({
            id: Date.now(),
            senderId: this.currentUser.id,
            senderName: this.currentUser.nickname,
            type: 'gif',
            url: url,
            timestamp: Date.now()
        });

        document.getElementById('modal-gif').classList.add('hidden');
        this.saveData();
        this.renderMessages(this.activeChat);
        this.renderChats();
    },

    // ============ EMOJI ============
    setupEmoji() {
        const grid = document.getElementById('emoji-grid');
        this.emojis.forEach(emoji => {
            const el = document.createElement('span');
            el.className = 'emoji-item';
            el.textContent = emoji;
            el.onclick = () => {
                const input = document.getElementById('message-input');
                input.value += emoji;
                input.focus();
            };
            grid.appendChild(el);
        });
    },

    // ============ CALLS ============
    setupCall() {
        let callTimer = null;
        let callSeconds = 0;
        let isMuted = false;
        let isVideoOn = true;

        document.getElementById('call-mute').onclick = () => {
            isMuted = !isMuted;
            const btn = document.getElementById('call-mute');
            if (isMuted) {
                btn.classList.add('muted');
                btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            } else {
                btn.classList.remove('muted');
                btn.innerHTML = '<i class="fas fa-microphone"></i>';
            }
        };

        document.getElementById('call-video-toggle').onclick = () => {
            isVideoOn = !isVideoOn;
            const btn = document.getElementById('call-video-toggle');
            if (!isVideoOn) {
                btn.classList.add('muted');
                btn.innerHTML = '<i class="fas fa-video-slash"></i>';
            } else {
                btn.classList.remove('muted');
                btn.innerHTML = '<i class="fas fa-video"></i>';
            }
        };

        document.getElementById('call-end').onclick = () => {
            this.endCall();
        };

        document.getElementById('call-accept').onclick = () => {
            document.getElementById('call-incoming').classList.add('hidden');
            document.getElementById('call-controls').classList.remove('hidden');
            document.getElementById('call-status-text').textContent = 'Подключено';
            this.startCallTimer();
        };

        document.getElementById('call-decline').onclick = () => {
            this.endCall(true);
        };
    },

    startCall(chat, isVideo) {
        const callScreen = document.getElementById('call-screen');
        callScreen.classList.remove('hidden');

        document.getElementById('call-name').textContent = chat.name;
        document.getElementById('call-status-text').textContent = 'Вызов...';
        document.getElementById('call-timer').classList.add('hidden');
        document.getElementById('call-controls').classList.remove('hidden');
        document.getElementById('call-incoming').classList.add('hidden');

        // Avatar
        const avatarEl = document.getElementById('call-avatar');
        if (chat.avatar) {
            avatarEl.innerHTML = `<img src="${chat.avatar}" style="width:120px;height:120px;border-radius:50%;object-fit:cover"><div class="call-pulse"></div>`;
        } else {
            avatarEl.innerHTML = `<div class="avatar-placeholder huge">${(chat.name||'U').charAt(0).toUpperCase()}</div><div class="call-pulse"></div>`;
        }

        // Simulate connection after 2-4 seconds
        setTimeout(() => {
            if (!callScreen.classList.contains('hidden')) {
                document.getElementById('call-status-text').textContent = 'Подключено';
                this.startCallTimer();
            }
        }, 2000 + Math.random() * 2000);

        // Add to calls history
        this.calls.unshift({
            id: 'call_' + Date.now(),
            name: chat.name,
            contactId: chat.contactId || chat.id,
            isVideo: isVideo,
            direction: 'outgoing',
            status: 'connected',
            timestamp: Date.now(),
            duration: ''
        });
        this.saveData();
        this.renderCalls();
    },

    startCallTimer() {
        this.callSeconds = 0;
        const timerEl = document.getElementById('call-timer');
        timerEl.classList.remove('hidden');

        this.callInterval = setInterval(() => {
            this.callSeconds++;
            const min = Math.floor(this.callSeconds / 60).toString().padStart(2, '0');
            const sec = (this.callSeconds % 60).toString().padStart(2, '0');
            timerEl.textContent = `${min}:${sec}`;
        }, 1000);
    },

    endCall(missed = false) {
        clearInterval(this.callInterval);
        document.getElementById('call-screen').classList.add('hidden');

        // Update last call record
        if (this.calls.length > 0) {
            const lastCall = this.calls[0];
            if (missed) {
                lastCall.status = 'missed';
            }
            if (this.callSeconds > 0) {
                const min = Math.floor(this.callSeconds / 60).toString().padStart(2, '0');
                const sec = (this.callSeconds % 60).toString().padStart(2, '0');
                lastCall.duration = `${min}:${sec}`;
            }
            this.saveData();
            this.renderCalls();

            // Update badge for missed calls
            const missedCount = this.calls.filter(c => c.status === 'missed').length;
            const badge = document.getElementById('calls-badge');
            if (missedCount > 0) {
                badge.textContent = missedCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        this.callSeconds = 0;

        // Reset mute/video
        document.getElementById('call-mute').classList.remove('muted');
        document.getElementById('call-mute').innerHTML = '<i class="fas fa-microphone"></i>';
        document.getElementById('call-video-toggle').classList.remove('muted');
        document.getElementById('call-video-toggle').innerHTML = '<i class="fas fa-video"></i>';
    },

    showUserProfile(chat) {
        const modal = document.getElementById('modal-user-profile');
        document.getElementById('up-name').textContent = chat.name;
        document.getElementById('up-id').textContent = chat.contactId || chat.id;

        const avatarEl = document.getElementById('up-avatar');
        if (chat.avatar) {
            avatarEl.innerHTML = `<img src="${chat.avatar}" style="width:80px;height:80px;border-radius:50%;object-fit:cover">`;
        } else {
            avatarEl.innerHTML = `<div class="avatar-placeholder large">${(chat.name||'U').charAt(0).toUpperCase()}</div>`;
        }

        // Find contact bio
        const contact = this.contacts.find(c => c.id === (chat.contactId || chat.id));
        document.getElementById('up-bio').textContent = (contact && contact.bio) ? contact.bio : 'Нет описания';

        document.getElementById('up-message').onclick = () => {
            modal.classList.add('hidden');
            this.openChat(chat);
        };

        document.getElementById('up-call').onclick = () => {
            modal.classList.add('hidden');
            this.startCall(chat, false);
        };

        modal.classList.remove('hidden');
    },

    // ============ UTILITIES ============
    filterChats(query) {
        const items = document.querySelectorAll('#chats-list .chat-item');
        query = query.toLowerCase();
        items.forEach(item => {
            const name = item.querySelector('.chat-item-name').textContent.toLowerCase();
            item.style.display = name.includes(query) ? '' : 'none';
        });
    },

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const time = date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });

        if (isToday) return time;

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Вчера ' + time;

        return date.toLocaleDateString('ru', { day: 'numeric', month: 'short' }) + ' ' + time;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    notify(text, type = 'info') {
        const container = document.getElementById('notifications');
        const el = document.createElement('div');
        el.className = `notification ${type}`;

        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
        el.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span class="notification-text">${text}</span>
        `;

        container.appendChild(el);
        setTimeout(() => {
            el.style.animation = 'notifIn 0.3s ease reverse';
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }
};

// Start app
document.addEventListener('DOMContentLoaded', () => App.init());