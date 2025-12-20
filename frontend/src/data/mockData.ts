export const MOCK_COURSES = [
  { id: '0058', semester: '1132', classGroup: 'A0', name: '系統分析與設計', department: '資管系', grade: '3', teacher: '連中岳', credits: 3, time: '一 / 02,03,04', location: 'B210', capacity: '22/60', type: '必修' },
  { id: '0132', semester: '1132', classGroup: 'B0', name: '網頁程式設計', department: '資管系', grade: '2', teacher: '林劍秋', credits: 3, time: '三 / 05,06,07', location: 'F405', capacity: '35/45', type: '選修' },
  { id: '0205', semester: '1132', classGroup: 'A0', name: '資料庫管理', department: '資管系', grade: '2', teacher: '陳偉業', credits: 3, time: '二 / 02,03,04', location: 'G302', capacity: '40/50', type: '必修' },
  { id: '0311', semester: '1132', classGroup: 'C0', name: '人工智慧導論', department: '資管系', grade: '4', teacher: '王小明', credits: 2, time: '五 / 05,06', location: 'B101', capacity: '58/60', type: '選修' },
  { id: '0488', semester: '1132', classGroup: 'A0', name: '專案管理', department: '資管系', grade: '3', teacher: '李美麗', credits: 3, time: '四 / 08,09,10', location: 'C202', capacity: '12/50', type: '必修' },
]

// --- 新增：使用者資料 (給管理者管理用) ---
export const MOCK_USERS_LIST = [
  { id: '122214250', name: '吳名式', department: '資訊管理系', status: 'normal' }, // status: normal, banned
  { id: '122214251', name: '陳小明', department: '護理系', status: 'banned' },
  { id: '122214252', name: '王大衛', department: '幼保系', status: 'normal' },
]

// --- 新增：留言資料 (給管理者管理用) ---
export const MOCK_ALL_COMMENTS = [
  { id: 1, courseName: '系統分析與設計', user: '吳名式', content: '老師人很好，推推！', status: 'normal' },
  { id: 2, courseName: '網頁程式設計', user: '匿名', content: '這堂課作業很多，要小心。', status: 'normal' },
  { id: 3, courseName: '資料庫管理', user: '陳小明', content: '廢課，不要選 (情緒性發言)', status: 'flagged' },
]