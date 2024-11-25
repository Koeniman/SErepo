document.addEventListener('DOMContentLoaded', () => {
    // 监听所有任务的点击事件
    const taskElements = document.querySelectorAll('.time-section p');
    taskElements.forEach(taskElement => {
        taskElement.addEventListener('click', () => {
            const taskId = taskElement.dataset.id; // 从 data-id 属性获取任务唯一 ID
            const newStatus = toggleTaskStatus(taskElement); // 切换任务状态
            updateTaskStatusOnServer(taskId, newStatus); // 同步到后端
        });
    });
});

/**
 * 切换任务状态并返回新的状态
 * @param {HTMLElement} taskElement - 任务元素
 * @returns {string} - 新的任务状态
 */
function toggleTaskStatus(taskElement) {
    if (taskElement.classList.contains('pending')) {
        taskElement.classList.remove('pending');
        taskElement.classList.add('completed');
        return 'completed';
    } else if (taskElement.classList.contains('completed')) {
        taskElement.classList.remove('completed');
        taskElement.classList.add('pending');
        return 'pending';
    }
}

/**
 * 同步任务状态到后端
 * @param {string} taskId - 任务的唯一 ID
 * @param {string} newStatus - 更新后的任务状态
 */
function updateTaskStatusOnServer(taskId, newStatus) {
    const today = "2024-11-22"; // 当前日期（可以动态获取）
    alert("update ");
    fetch(`http://localhost:3000/tasks/${today}/${taskId}`, {
        method: 'PATCH', // 使用 PATCH 方法更新部分数据
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update task status');
            }
            return response.json();
        })
        .then(data => {
            console.log('任务状态更新成功：', data);
        })
        .catch(error => {
            console.error('任务状态更新失败：', error);
            alert('状态更新失败，请稍后重试。');
        });
}
