// 主函数：加载并分类显示任务
function loadTasks(date) {
    const fileName = `../tasks/${date}.json`; // JSON 文件路径
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

// 示例：加载 2024-11-22 的任务
const today = "2024-11-22";
loadTasks(today);
