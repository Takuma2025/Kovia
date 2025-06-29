// Override renderLogicMenu to reuse grammar card design exactly
function renderLogicMenu() {
  const logicMenu = document.getElementById('logicMenu');
  if (!logicMenu) return;
  logicMenu.innerHTML = '';

  logicTrainingItems.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'grammar-item';
    itemElement.innerHTML = `
      <div class="grammar-item-header">
        <div class="grammar-item-number">${String(index + 1).padStart(2, '0')}</div>
      </div>
      <div class="grammar-item-content">
        <div class="grammar-item-title">
          ${item.title}
        </div>
        <div class="grammar-item-description">
          ${item.description}
        </div>
        <div class="grammar-item-progress">
                  <div class="progress-boxes" id="logic-boxes-${item.id}">
          <!-- ボックス形式の進捗ゲージがここに生成されます -->
        </div>
          <span class="progress-numbers" id="logic-num-${item.id}">0/0</span>
        </div>
      </div>
      <div class="grammar-item-right">
        <div class="grammar-item-action">
          <span class="action-text">Start</span>
          <span class="action-arrow">→</span>
        </div>
      </div>
    `;
    
    // クリックイベントを追加
    itemElement.addEventListener('click', () => {
      if (item.status === 'available') {
        startLogicTraining(item.id);
      } else {
        alert(`${item.title}は${item.badge}です。`);
      }
    });
    
    logicMenu.appendChild(itemElement);
  });
  
  // 進捗を更新（文法メニューと同じタイミング）
  setTimeout(() => {
    updateLogicProgress();
  }, 100);
}

// ===== 進捗管理 =====
function getLogicProgress() {
  const saved = localStorage.getItem('logicProgress');
  if (saved) return JSON.parse(saved);
  
  // デフォルトの進捗データ（文法と同じ形式）
  const defaultProgress = {};
  logicTrainingItems.forEach(item => {
    // 仮の問題数を設定
    defaultProgress[item.id] = { solved: 0, total: 10 };
  });
  return defaultProgress;
}

function saveLogicProgress(obj) {
  localStorage.setItem('logicProgress', JSON.stringify(obj));
}

// サブメニュー数ベースの進捗バー更新ロジック
function updateLogicProgress() {
  logicTrainingItems.forEach(item => {
    // サブメニューの完了数を計算
    const completedSubmenus = calculateLogicCompletedSubmenus(item);
    const totalSubmenus = item.submenu ? item.submenu.length : 0;
    
    // 進捗数値を更新
    const numEl = document.getElementById(`logic-num-${item.id}`);
    if (numEl) {
      numEl.textContent = `${completedSubmenus}/${totalSubmenus}`;
      
      // 進捗数値のクラスをリセット
      numEl.classList.remove('high-progress', 'medium-progress', 'low-progress');
      
      // 進捗に応じて動的な色調整
      const percentage = totalSubmenus > 0 ? (completedSubmenus / totalSubmenus) * 100 : 0;
      if (percentage >= 80) {
        numEl.classList.add('high-progress');
      } else if (percentage >= 50) {
        numEl.classList.add('medium-progress');
      } else if (percentage > 0) {
        numEl.classList.add('low-progress');
      }
    }
    
    // ボックス形式の進捗ゲージを更新
    const boxesEl = document.getElementById(`logic-boxes-${item.id}`);
    if (boxesEl) {
      updateLogicProgressBoxes(boxesEl, item.id);
    }
  });
}

// 完了したサブメニューの数を計算
function calculateLogicCompletedSubmenus(item) {
  if (!item.submenu) return 0;
  
  const progress = getLogicProgress();
  let completedCount = 0;
  
  item.submenu.forEach(subItem => {
    const subProgress = progress[item.id] && progress[item.id][subItem.id];
    
    if (subProgress) {
      const solved = subProgress.solved || 0;
      const total = subProgress.total || 0;
      const completionRate = total > 0 ? solved / total : 0;
      
      // 80%以上完了していれば完了とみなす
      if (completionRate >= 0.8) {
        completedCount++;
      }
    }
  });
  
  return completedCount;
}

// ボックス形式の進捗ゲージを更新（サブメニュー数ベース）
function updateLogicProgressBoxes(container, itemId) {
  // コンテナをクリア
  container.innerHTML = '';
  
  // 該当する論理項目を取得
  const item = logicTrainingItems.find(i => i.id === itemId);
  if (!item || !item.submenu) return;
  
  // 進捗データを取得
  const progress = getLogicProgress();
  
  // 各サブメニューに対してボックスを作成
  item.submenu.forEach((subItem, index) => {
    const box = document.createElement('div');
    box.className = 'progress-box';
    
    // このサブメニューの進捗状況を確認
    const subProgress = progress[itemId] && progress[itemId][subItem.id];
    
    if (subProgress) {
      const solved = subProgress.solved || 0;
      const total = subProgress.total || 0;
      const completionRate = total > 0 ? solved / total : 0;
      
      // 完了率に応じてボックスの状態を設定
      if (completionRate >= 1.0) {
        // 100%完了 - 完全に塗りつぶし
        box.classList.add('filled');
      } else if (completionRate > 0) {
        // 部分的完了 - オレンジ中間色
        box.style.background = '#ffab7a';
      }
      // else: 未着手 - デフォルトの空ボックス
    }
    
    // ツールチップとして項目名を表示
    box.title = subItem.title;
    
    container.appendChild(box);
  });
}

// ゲーム終了時に呼び出し想定
function updateLogicProgressAfterCompletion(itemId, solved, total) {
  const progress = getLogicProgress();
  progress[itemId] = { solved, total };
  saveLogicProgress(progress);
} 