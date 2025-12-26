/**
 * @Author: Your name
 * @Date:   2025-12-26 11:57:42
 * @Last Modified by:   Your name
 * @Last Modified time: 2025-12-26 12:11:51
 */
import './style.css';
import { PinyinConverter } from './components/PinyinConverter.js';

// 创建HTML结构
document.getElementById('app').innerHTML = `
    <div class="container">
        <h1>🔠 汉字拼音转换器</h1>
        
        <div class="input-section">
            <textarea id="input" placeholder="在此输入需要转换的汉字..."></textarea>
        </div>

        <div class="controls">
            <div class="control-group">
                <span class="control-label">显示模式：</span>
                <label><input type="radio" name="displayMode" value="ruby" checked> 注音模式(上方)</label>
                <label><input type="radio" name="displayMode" value="bracket"> 括号模式(跟随)</label>
                <label><input type="radio" name="displayMode" value="text"> 纯文本</label>
            </div>

            <div class="control-group">
                <span class="control-label">声调类型：</span>
                <select id="toneType">
                    <option value="symbol">带声调符号 (hǎo)</option>
                    <option value="num">数字声调 (hao3)</option>
                    <option value="none">无声调 (hao)</option>
                </select>
            </div>


        </div>

        <div class="output-section">
            <div class="output-header">
                <h3>转换结果 
                    <span id="dictStatus" class="dict-status" style="display: none;"></span>
                </h3>
                <div>
                    <button class="btn btn-outline" id="copyBtn">复制结果</button>
                    <button class="btn btn-outline" id="resetBtn">重置拼音</button>
                </div>
            </div>
            <div id="loading" class="loading">转换中...</div>
            <div id="result"></div>
        </div>
    </div>

    <!-- 编辑模态框 -->
    <div class="edit-modal" id="editModal">
        <div class="edit-modal-content">
            <h2>修改拼音</h2>
            <div class="edit-item">
                <label class="edit-label">汉字：</label>
                <div style="font-size: 24px; padding: 10px; text-align: center; background: #f8f9fa; border-radius: 4px;" id="editChar"></div>
            </div>
            <div class="edit-item">
                <label class="edit-label">原始拼音：</label>
                <div style="font-size: 16px; color: #666; padding: 8px;" id="editOriginal"></div>
            </div>
            <div class="edit-item">
                <label class="edit-label">新拼音：</label>
                <input type="text" class="edit-input" id="editPinyin" placeholder="输入新的拼音">
            </div>
            <div class="edit-buttons">
                <button class="btn-confirm" id="editConfirm">确认</button>
                <button class="btn-cancel" id="editCancel">取消</button>
                <button class="btn-reset" id="editReset">恢复原值</button>
            </div>
        </div>
    </div>
`;

// 初始化应用
new PinyinConverter();