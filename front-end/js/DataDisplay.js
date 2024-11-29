function countNr(date) {
    const fileName = `http://localhost:3000/tasks/${date}`; // JSON 文件路径
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error("文件 ${fileName} 不存在或加载失败");
            }
            return response.json();
        })
        .then(data => {
            let nr_task = data.tasks.length; // 更新全局任务数量
            document.getElementById('task-count').textContent = nr_task.toString();
            let nr_star = 0;
            let nr_completed = 0;
            let nr_pending = 0;
            for (let task of data.tasks) {
                const taskClass = task.status; // 任务的时间（格式：HH:MM）
                // 如果任务时间小于当前时间，且任务状态不是 "逾期"
                if (taskClass === 'star') {
                    nr_star++;
                    nr_pending++;
                }
                if (taskClass === 'completed') {
                    nr_completed++;
                }
                if(taskClass === 'pending') {
                    nr_pending++;
                }
            }
            document.getElementById('star-count').textContent = nr_star.toString();
            document.getElementById('comp-count').textContent = nr_completed.toString();
            document.getElementById('pending-count').textContent = nr_pending.toString();
        })
        .catch(error => {
            console.error("加载任务时出错：", error);
            alert("无法加载任务，请检查文件路径或文件名是否正确。");
        });
}
countNr(today);