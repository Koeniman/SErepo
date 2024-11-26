let nrtasks = 0; // 全局变量，用于记录任务数量
const today = "2024-11-22";
loadTasks(today);
alert("init");
// 主函数：加载并分类显示任务，并启用点击监听
function loadTasks(date) {
    const fileName = `http://localhost:3000/tasks/${date}`; // JSON 文件路径
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`文件 ${fileName} 不存在或加载失败`);
            }
            return response.json();
        })
        .then(data => {
            const groupedTasks = categorizeTasks(data.tasks); // 分类并排序任务
            renderTasks(groupedTasks); // 渲染任务
            nrtasks = data.tasks.length; // 更新全局任务数量
            addClickListeners(); // 在任务渲染后添加点击监听器
        })
        .catch(error => {
            console.error("加载任务时出错：", error);
            alert("无法加载任务，请检查文件路径或文件名是否正确。");
        });
}

// 分类任务函数：按时间段分组，并按时间排序
function categorizeTasks(tasks) {
    const categories = {
        morning: [], afternoon: [], evening: []
    };

    tasks.forEach(task => {
        const [hour] = task.time.split(':').map(Number); // 获取小时部分
        if (hour < 12) {
            categories.morning.push(task);
        } else if (hour < 18) {
            categories.afternoon.push(task);
        } else {
            categories.evening.push(task);
        }
    });

    // 对每个分类的任务按时间排序
    Object.keys(categories).forEach(category => {
        categories[category].sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            return timeA[0] - timeB[0] || timeA[1] - timeB[1]; // 按小时和分钟排序
        });
    });

    return categories;
}

// 渲染任务函数
function renderTasks(groupedTasks) {
    const timeSection = document.querySelector('.time-section'); // 任务容器
    timeSection.innerHTML = ''; // 清空旧任务

    // 定义分类名称
    const categoryNames = {
        morning: '上午',
        afternoon: '下午',
        evening: '晚上'
    };

    // 遍历每个分类并渲染任务
    Object.entries(groupedTasks).forEach(([category, tasks]) => {
        if (tasks.length > 0) {
            // 创建分类容器
            const categoryContainer = document.createElement('div');
            categoryContainer.classList.add('category-container');

            // 添加分类标题
            const categoryTitle = document.createElement('strong');
            categoryTitle.textContent = categoryNames[category];
            categoryContainer.appendChild(categoryTitle);

            // 渲染任务
            tasks.forEach(task => {
                const taskElement = document.createElement('p');
                taskElement.className = task.status; // 根据任务的 status 设置 class
                taskElement.dataset.taskId = task.id; // 给每个任务元素加上 data-task-id 属性
                taskElement.innerHTML = `${task.time} ${task.title}`;
                categoryContainer.appendChild(taskElement);
            });

            // 添加分割线
            const divider = document.createElement('div');
            divider.classList.add('divider'); // 添加一个样式类
            categoryContainer.appendChild(divider);

            // 将分类容器添加到任务列表
            timeSection.appendChild(categoryContainer);
        }
    });
}

// 点击监听器函数
function addClickListeners() {
    const timeSection = document.querySelector('.time-section'); // 任务容器

    // 检查是否有任务元素
    if (!timeSection) {
        console.error('任务容器未找到。');
        return;
    }

    // 为动态生成的任务条目绑定点击事件
    timeSection.addEventListener('click', (event) => {
        const clickedElement = event.target;

        // 确保点击的是任务条目
        if (clickedElement.tagName.toLowerCase() === 'p' && clickedElement.className) {
            const taskId = clickedElement.dataset.taskId; // 获取任务的 ID
            const newStatus = clickedElement.className === 'pending' ? 'completed' : 'pending'; // 反转状态

            // 更新任务状态
            updateTaskStatus(taskId, newStatus);
        }
    },{once : true});
    // 使用过后即消除，防止监听器呈指数增长
}

// 更新任务状态函数
function updateTaskStatus(taskId, newStatus) {
    const today = "2024-11-22"; // 使用当前日期
    fetch(`http://localhost:3000/tasks/${today}/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update task status');
            }
            return response.json();
        })
        .then(data => {
            console.log('Task status updated:', data);
            loadTasks(today); // 重新加载任务列表
        })
        .catch(error => {
            console.error('Error updating task status:', error);
        });
}


