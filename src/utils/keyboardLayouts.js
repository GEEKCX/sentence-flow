/**
 * 键盘布局定义
 * 支持 QWERTY, Dvorak, Colemak, Workman
 */

export const KEYBOARD_LAYOUTS = {
  qwerty: {
    name: 'QWERTY',
    nameZh: '标准布局',
    description: '最常用的键盘布局',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
    ],
    homeRow: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
  },
  
  dvorak: {
    name: 'Dvorak',
    nameZh: '德沃夏克',
    description: '为提高打字效率设计的布局',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']'],
      ["'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '='],
      ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-'],
      [';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z']
    ],
    homeRow: ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's']
  },
  
  colemak: {
    name: 'Colemak',
    nameZh: '科尔马克',
    description: '现代化的效率布局，保留常用快捷键',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
      ['q', 'w', 'f', 'p', 'g', 'j', 'l', 'u', 'y', ';', '[', ']', '\\'],
      ['a', 'r', 's', 't', 'd', 'h', 'n', 'e', 'i', 'o', "'"],
      ['z', 'x', 'c', 'v', 'b', 'k', 'm', ',', '.', '/']
    ],
    homeRow: ['a', 'r', 's', 't', 'd', 'h', 'n', 'e', 'i', 'o']
  },
  
  workman: {
    name: 'Workman',
    nameZh: '沃克曼',
    description: '专为减少手指移动设计的布局',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
      ['q', 'd', 'r', 'w', 'b', 'j', 'f', 'u', 'p', ';', '[', ']', '\\'],
      ['a', 's', 'h', 't', 'g', 'y', 'n', 'e', 'o', 'i', "'"],
      ['z', 'x', 'm', 'c', 'v', 'k', 'l', ',', '.', '/']
    ],
    homeRow: ['a', 's', 'h', 't', 'g', 'y', 'n', 'e', 'o', 'i']
  }
};

/**
 * 获取布局的所有键位
 * @param {string} layoutName 布局名称
 */
export function getLayoutKeys(layoutName) {
  const layout = KEYBOARD_LAYOUTS[layoutName];
  if (!layout) return [];
  
  return layout.rows.flat();
}

/**
 * 检查键位是否在指定布局中
 * @param {string} key 键位
 * @param {string} layoutName 布局名称
 */
export function isKeyInLayout(key, layoutName) {
  const keys = getLayoutKeys(layoutName);
  return keys.includes(key.toLowerCase());
}

/**
 * 获取布局的主行键位
 * @param {string} layoutName 布局名称
 */
export function getHomeRowKeys(layoutName) {
  const layout = KEYBOARD_LAYOUTS[layoutName];
  return layout ? layout.homeRow : [];
}

/**
 * 获取布局列表（用于下拉选择）
 */
export function getLayoutOptions() {
  return Object.entries(KEYBOARD_LAYOUTS).map(([key, layout]) => ({
    value: key,
    label: `${layout.name} - ${layout.nameZh}`,
    description: layout.description
  }));
}

/**
 * 默认布局
 */
export const DEFAULT_LAYOUT = 'qwerty';
