// 动态生成小时选项
const taskHourSelect = document.getElementById('task-hour');
taskHourSelect.innerHTML += [...Array(24).keys()].map(hour => `
            <option value="${hour}">${hour.toString().padStart(2, '0')}</option>`).join('');
const taskMinuteSelect = document.getElementById('task-minute');
taskMinuteSelect.innerHTML += [...Array(60).keys()].map(minute => `
            <option value="${minute}">${minute.toString().padStart(2, '0')}</option>`).join('');
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('add-task-modal');
    const addTaskBtn = document.querySelector('.add-task-btn');
    const confirmAddBtn = document.getElementById('confirm-add');
    const cancelAddBtn = document.getElementById('cancel-add');

    // 打开弹出框
    addTaskBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    // 关闭弹出框
    cancelAddBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // 确认添加任务
    confirmAddBtn.addEventListener('click', () => {
        const titleElement = document.getElementById('task-title');
        const hourElement = document.getElementById('task-hour');
        const minuteElement = document.getElementById('task-minute');
        const classElement = document.getElementById('task-class');

        if (!titleElement || !hourElement || !minuteElement) {
            console.error('Missing required input elements in the DOM.');
            return;
        }

        const titleInput = titleElement.value.trim();
        const hourInput = hourElement.value;
        const minuteInput = minuteElement.value;
        const classInput = classElement.value === 'default'? 'pending':'star';
        if (!titleInput) {
            alert('请输入任务名称！');
            return;
        }

        // 为新任务分配 ID，ID 递增
        const task = {
            id: (taskCount + 1).toString(), // 分配新的 ID
            time: `${hourInput.padStart(2, '0')}:${minuteInput.padStart(2, '0')}`,
            title: titleInput,
            status: `${classInput}`
        };
        const today = "2024-11-22";

        // 发送任务添加请求
        fetch(`http://localhost:3000/tasks/${today}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(task)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add task');
                }
                return response.json();
            })
            .then(() => {
                modal.classList.add('hidden');
                renderTasks(today); // 重新渲染任务列表
                countNr(today);
            })
            .catch(error => console.error('Error adding task:', error));
    });
});
