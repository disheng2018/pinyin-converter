/**
 * @Author: Your name
 * @Date:   2025-12-26 11:57:03
 * @Last Modified by:   Your name
 * @Last Modified time: 2025-12-26 12:25:48
 */
import { pinyin, addDict } from 'pinyin-pro';
import ModernChineseDict from '@pinyin-pro/data/modern';

export class PinyinConverter {
    constructor() {
        this.pinyinOverrides = {};
        this.convertedData = [];
        this.currentEditingIndex = null;
        this.currentEditingData = null;
        this.isDictLoaded = false;
        
        this.initializeDict();
        this.bindEvents();
    }

    initializeDict() {
        try {
            addDict(ModernChineseDict);
            this.isDictLoaded = true;
            this.updateDictStatus('success', '✓ 扩展字典已加载');
            console.log('本地字典加载成功');
        } catch (error) {
            console.error('字典加载失败:', error);
            this.updateDictStatus('error', '⚠️ 字典加载失败');
        }
    }

    updateDictStatus(type, message) {
        const dictStatusEl = document.getElementById('dictStatus');
        if (dictStatusEl) {
            dictStatusEl.className = `dict-status ${type}`;
            dictStatusEl.innerText = message;
            dictStatusEl.style.display = 'inline-block';
        }
    }

    bindEvents() {
        // 等待DOM加载完成后绑定事件
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.loadDefaultText();
        });
    }

    setupEventListeners() {
        const inputEl = document.getElementById('input');
        const toneTypeEl = document.getElementById('toneType');
        const convertBtn = document.getElementById('convertBtn');
        const copyBtn = document.getElementById('copyBtn');
        const resetBtn = document.getElementById('resetBtn');
        const displayModes = document.getElementsByName('displayMode');

        // 编辑相关元素
        const editModal = document.getElementById('editModal');
        const editPinyin = document.getElementById('editPinyin');
        const editConfirm = document.getElementById('editConfirm');
        const editCancel = document.getElementById('editCancel');
        const editReset = document.getElementById('editReset');

        let timeout;
        inputEl?.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.convert(), 500);
        });

        toneTypeEl?.addEventListener('change', () => this.convert());
        displayModes?.forEach(mode => mode.addEventListener('change', () => this.convert()));
        convertBtn?.addEventListener('click', () => this.convert());
        copyBtn?.addEventListener('click', () => this.copyResult());
        resetBtn?.addEventListener('click', () => this.resetPinyin());

        // 编辑模态框事件
        editConfirm?.addEventListener('click', () => this.confirmEdit());
        editCancel?.addEventListener('click', () => this.closeEditModal());
        editReset?.addEventListener('click', () => this.resetEdit());

        editPinyin?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.confirmEdit();
            }
        });

        editModal?.addEventListener('click', (e) => {
            if (e.target === editModal) {
                this.closeEditModal();
            }
        });
    }

    getDisplayMode() {
        const modes = document.getElementsByName('displayMode');
        for (let mode of modes) {
            if (mode.checked) return mode.value;
        }
        return 'ruby';
    }

    convert() {
        const inputEl = document.getElementById('input');
        const resultEl = document.getElementById('result');
        const toneTypeEl = document.getElementById('toneType');

        const text = inputEl?.value || '';
        if (!text) {
            if (resultEl) resultEl.innerHTML = '';
            this.convertedData = [];
            return;
        }

        const toneType = toneTypeEl?.value || 'symbol';
        const mode = this.getDisplayMode();
        const options = {
            toneType: toneType,
            type: 'all',
            nonZh: 'consecutive'
        };

        try {
            const data = pinyin(text, options);
            this.convertedData = data;
            
            let html = '';

            if (mode === 'text') {
                data.forEach(item => {
                    if (item.isZh) {
                        const overridePinyin = this.pinyinOverrides[item.origin + '_' + item.pinyin] || item.pinyin;
                        html += overridePinyin + ' ';
                    } else {
                        html += item.origin.replace(/\n/g, '<br>');
                    }
                });
            } else {
                data.forEach((item, index) => {
                    if (item.isZh) {
                        const overrideKey = item.origin + '_' + item.pinyin;
                        const displayPinyin = this.pinyinOverrides[overrideKey] || item.pinyin;
                        const isModified = this.pinyinOverrides[overrideKey] !== undefined;

                        if (mode === 'ruby') {
                            html += `<ruby data-index="${index}" class="editable" data-char="${item.origin}" data-original="${item.pinyin}">
                                <span class="tian-grid"><span class="tian-char">${item.origin}</span></span>
                                <rt class="${isModified ? 'modified' : ''}">${displayPinyin}</rt>
                            </ruby>`;
                        } else if (mode === 'bracket') {
                            html += `<span class="editable" data-index="${index}" data-char="${item.origin}" data-original="${item.pinyin}" style="cursor:pointer;padding:0 2px;" title="点击编辑拼音">${item.origin}(<span style="${isModified ? 'color:#e74c3c;font-weight:bold;' : ''}">${displayPinyin}</span>) </span>`;
                        }
                    } else {
                        html += item.origin.replace(/\n/g, '<br>');
                    }
                });
            }

            if (resultEl) {
                resultEl.innerHTML = html;
                
                // 为可编辑元素添加点击事件
                document.querySelectorAll('.editable').forEach(el => {
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const char = el.getAttribute('data-char');
                        const original = el.getAttribute('data-original');
                        const index = el.getAttribute('data-index');
                        
                        this.openEditModal(char, original, index);
                    });
                });
            }

        } catch (e) {
            console.error('转换错误:', e);
            if (resultEl) {
                resultEl.innerHTML = `<div style="color: #e74c3c; text-align: center; padding: 20px;">
                    转换出错：${e.message}<br>
                    <small>请检查输入内容或尝试刷新页面</small>
                </div>`;
            }
        }
    }

    openEditModal(char, original, index) {
        this.currentEditingIndex = index;
        this.currentEditingData = { char, original };

        const editModal = document.getElementById('editModal');
        const editChar = document.getElementById('editChar');
        const editOriginal = document.getElementById('editOriginal');
        const editPinyin = document.getElementById('editPinyin');

        if (editChar) editChar.textContent = char;
        if (editOriginal) editOriginal.textContent = original;

        const overrideKey = char + '_' + original;
        if (editPinyin) {
            editPinyin.value = this.pinyinOverrides[overrideKey] || original;
        }

        editModal?.classList.add('show');
        editPinyin?.focus();
        editPinyin?.select();
    }

    closeEditModal() {
        const editModal = document.getElementById('editModal');
        editModal?.classList.remove('show');
        this.currentEditingIndex = null;
        this.currentEditingData = null;
    }

    confirmEdit() {
        if (this.currentEditingData) {
            const editPinyin = document.getElementById('editPinyin');
            const newPinyin = editPinyin?.value.trim() || '';
            
            if (newPinyin) {
                const overrideKey = this.currentEditingData.char + '_' + this.currentEditingData.original;
                if (newPinyin === this.currentEditingData.original) {
                    delete this.pinyinOverrides[overrideKey];
                } else {
                    this.pinyinOverrides[overrideKey] = newPinyin;
                }
                this.convert();
                this.closeEditModal();
            }
        }
    }

    resetEdit() {
        const editPinyin = document.getElementById('editPinyin');
        if (editPinyin && this.currentEditingData) {
            editPinyin.value = this.currentEditingData.original;
        }
    }

    resetPinyin() {
        this.pinyinOverrides = {};
        this.convert();
    }

    generateCopyText(data) {
        let copyText = '';
        
        data.forEach(item => {
            if (item.isZh) {
                const overrideKey = item.origin + '_' + item.pinyin;
                const displayPinyin = this.pinyinOverrides[overrideKey] || item.pinyin;
                copyText += `${item.origin}（${displayPinyin}）`;
            } else {
                copyText += item.origin;
            }
        });
        
        return copyText;
    }

    // copyResult() {
    //     if (!this.convertedData.length) return;
        
    //     const copyText = this.generateCopyText(this.convertedData);
        
    //     if (!copyText) return;
        
    //     const copyBtn = document.getElementById('copyBtn');
        
    //     navigator.clipboard.writeText(copyText).then(() => {
    //         this.showCopySuccess(copyBtn);
    //     }).catch(() => {
    //         // 备用方案：创建临时文本域
    //         const textArea = document.createElement('textarea');
    //         textArea.value = copyText;
    //         textArea.style.position = 'fixed';
    //         textArea.style.opacity = '0';
    //         document.body.appendChild(textArea);
    //         textArea.select();
            
    //         try {
    //             document.execCommand('copy');
    //             this.showCopySuccess(copyBtn);
    //         } catch (err) {
    //             console.error('复制失败', err);
    //         }
            
    //         document.body.removeChild(textArea);
    //     });
    // }

    // showCopySuccess(button) {
    //     if (!button) return;
        
    //     const originalText = button.innerText;
    //     button.innerText = '已复制!';
    //     setTimeout(() => {
    //         button.innerText = originalText;
    //     }, 2000);
    // }
// 修改 copyResult 方法
copyResult() {
    console.log('copyResult 被调用');
    console.log('convertedData 长度:', this.convertedData.length);
    
    if (!this.convertedData.length) {
        this.showMessage('没有可复制的内容', 'warning');
        return;
    }
    
    const mode = this.getDisplayMode();
    let copyText = '';
    
    // 根据不同模式生成不同的复制文本
    if (mode === 'text') {
        // 纯文本模式：只复制拼音
        this.convertedData.forEach(item => {
            if (item.isZh) {
                const overrideKey = item.origin + '_' + item.pinyin;
                const displayPinyin = this.pinyinOverrides[overrideKey] || item.pinyin;
                copyText += displayPinyin + ' ';
            } else {
                copyText += item.origin;
            }
        });
    } else {
        // Ruby 模式和括号模式：汉字(拼音)格式
        this.convertedData.forEach(item => {
            if (item.isZh) {
                const overrideKey = item.origin + '_' + item.pinyin;
                const displayPinyin = this.pinyinOverrides[overrideKey] || item.pinyin;
                copyText += `${item.origin}(${displayPinyin}) `;
            } else {
                copyText += item.origin;
            }
        });
    }
    
    copyText = copyText.trim();
    
    if (!copyText) {
        this.showMessage('没有可复制的内容', 'warning');
        return;
    }
    
    console.log('准备复制的内容:', copyText);
    
    // 直接调用复制方法
    this.copyToClipboard(copyText);
}

// 重写 copyToClipboard 方法，更好地处理兼容性
copyToClipboard(text) {
    const copyBtn = document.getElementById('copyBtn');
    
    // 方法1：检查 Clipboard API 是否可用
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        console.log('使用 Clipboard API');
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Clipboard API 复制成功');
                this.showCopySuccess(copyBtn);
            })
            .catch(err => {
                console.error('Clipboard API 复制失败:', err);
                this.fallbackCopy(text, copyBtn);
            });
        return;
    }
    
    // 方法2：使用 execCommand
    console.log('使用 execCommand 方法');
    this.execCommandCopy(text, copyBtn);
}

// execCommand 复制方法
execCommandCopy(text, button) {
    try {
        // 创建临时 textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        
        // 设置样式，确保不影响页面布局
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.style.width = '1px';
        textarea.style.height = '1px';
        textarea.style.opacity = '0';
        textarea.style.border = 'none';
        textarea.style.outline = 'none';
        textarea.style.background = 'transparent';
        
        document.body.appendChild(textarea);
        
        // 选择文本
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, text.length);
        
        // 执行复制
        const successful = document.execCommand('copy');
        
        // 清理
        document.body.removeChild(textarea);
        
        if (successful) {
            console.log('execCommand 复制成功');
            this.showCopySuccess(button);
        } else {
            console.log('execCommand 复制失败');
            this.fallbackCopy(text, button);
        }
    } catch (err) {
        console.error('execCommand 复制出错:', err);
        this.fallbackCopy(text, button);
    }
}

// 备用复制方法 - 显示可选择的文本
fallbackCopy(text, button) {
    console.log('使用备用复制方法');
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'copy-modal-overlay';
    modal.innerHTML = `
        <div class="copy-modal">
            <div class="copy-modal-header">
                <h3>复制内容</h3>
                <button class="copy-modal-close">&times;</button>
            </div>
            <div class="copy-modal-body">
                <p>请手动选择以下内容并复制 (Ctrl+C 或 Cmd+C)：</p>
                <textarea readonly class="copy-textarea">${text}</textarea>
                <div class="copy-modal-buttons">
                    <button class="copy-try-again">重试自动复制</button>
                    <button class="copy-modal-done">完成</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 自动选择文本
    const textarea = modal.querySelector('.copy-textarea');
    textarea.focus();
    textarea.select();
    
    // 绑定事件
    const closeModal = () => {
        if (modal.parentNode) {
            modal.remove();
        }
    };
    
    modal.querySelector('.copy-modal-close').onclick = closeModal;
    modal.querySelector('.copy-modal-done').onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
    
    // 重试按钮
    modal.querySelector('.copy-try-again').onclick = () => {
        closeModal();
        this.execCommandCopy(text, button);
    };
    
    // ESC 键关闭
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    this.showMessage('请手动复制文本', 'info');
}

// 保持原有的 showCopySuccess 和 showMessage 方法不变
showCopySuccess(button) {
    if (!button) return;
    
    const originalText = button.innerHTML;
    const originalColor = button.style.backgroundColor;
    
    button.innerHTML = '✓ 已复制!';
    button.style.backgroundColor = '#28a745';
    button.disabled = true;
    
    this.showMessage('复制成功！', 'success');
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = originalColor;
        button.disabled = false;
    }, 2000);
}

showMessage(message, type = 'info') {
    const existingMsg = document.querySelector('.copy-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `copy-message copy-message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: bold;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    const colors = {
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8'
    };
    
    messageEl.style.backgroundColor = colors[type] || colors.info;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => messageEl.remove(), 300);
        }
    }, 3000);
}

    
    loadDefaultText() {
        const inputEl = document.getElementById('input');
        if (inputEl && !inputEl.value) {
            inputEl.value = "你好，世界！\n欢迎使用汉字拼音转换工具。";
            this.convert();
        }
    }
}