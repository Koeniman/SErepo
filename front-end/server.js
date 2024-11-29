const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 启用 CORS
app.use(cors());

// 中间件解析 JSON 请求体
app.use(express.json());

// 路由：向当天的 JSON 文件添加任务
app.post('/tasks/:date', (req, res) => {
    const { date } = req.params; // 获取日期参数，例如 "2024-11-22"
    const filePath = path.join(__dirname, 'tasks', `${date}.json`); // 文件路径
    const newTask = req.body; // 新任务数据
    const listsFilePath = path.join(__dirname, 'tasks', 'Lists.json'); // lists.json 文件路径

    // 检查任务数据是否完整
    if (!newTask.id || !newTask.time || !newTask.title || !newTask.status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 确保目标文件存在
    fs.readFile(filePath, 'utf8', (readErr, fileContent) => {
        if (readErr && readErr.code === 'ENOENT') {
            // 如果任务文件不存在，先向 lists.json 中写入当天日期
            fs.readFile(listsFilePath, 'utf8', (listReadErr, listContent) => {
                if (listReadErr && listReadErr.code === 'ENOENT') {
                    // 如果 lists.json 文件也不存在，初始化为空数组
                    const initialLists = [date];
                    fs.writeFile(listsFilePath, JSON.stringify(initialLists, null, 2), (listWriteErr) => {
                        if (listWriteErr) {
                            console.error('Error writing to lists.json:', listWriteErr);
                            return res.status(500).json({ error: 'Failed to create lists.json' });
                        }
                        console.log('lists.json created and initialized.');
                    });
                } else if (listReadErr) {
                    console.error('Error reading lists.json:', listReadErr);
                    return res.status(500).json({ error: 'Failed to read lists.json' });
                }

                // 如果 lists.json 文件存在，读取并更新日期
                let listsData;
                try {
                    listsData = JSON.parse(listContent);
                } catch (parseErr) {
                    console.error('Error parsing lists.json:', parseErr);
                    return res.status(500).json({ error: 'Invalid JSON format in lists.json' });
                }

                // 确保日期不重复
                if (!listsData.includes(date)) {
                    listsData.push(date);
                    fs.writeFile(listsFilePath, JSON.stringify(listsData, null, 2), (listWriteErr) => {
                        if (listWriteErr) {
                            console.error('Error writing to lists.json:', listWriteErr);
                            return res.status(500).json({ error: 'Failed to update lists.json' });
                        }
                        console.log('lists.json updated with new date.');
                    });
                }
            });

            // 创建并初始化新的任务文件
            const data = {
                date,
                tasks: [newTask]
            };
            return fs.writeFile(filePath, JSON.stringify(data, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing new task file:', writeErr);
                    return res.status(500).json({ error: 'Failed to create tasks file' });
                }
                return res.status(200).json({ message: 'Task added successfully (new file created)' });
            });
        } else if (readErr) {
            console.error('Error reading file:', readErr);
            return res.status(500).json({ error: 'Failed to read tasks file' });
        }

        // 如果任务文件存在，解析并添加任务
        let tasksData;
        try {
            tasksData = JSON.parse(fileContent); // 解析现有文件内容
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            return res.status(500).json({ error: 'Invalid JSON format in tasks file' });
        }

        // 更新任务列表
        tasksData.tasks.push(newTask);
        fs.writeFile(filePath, JSON.stringify(tasksData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to task file:', writeErr);
                return res.status(500).json({ error: 'Failed to write tasks file' });
            }
            return res.status(200).json({ message: 'Task added successfully' });
        });
    });
});


// 确保目标任务文件存在，不存在时创建
function ensureTaskFileExists(date) {
    const filePath = path.join(__dirname, 'tasks', `${date}.json`);
    const listsFilePath = path.join(__dirname, 'tasks', 'Lists.json'); // lists.json 文件路径
    if (!fs.existsSync(filePath)) {
        // 文件不存在时，创建并初始化为空数组
        fs.writeFileSync(filePath, JSON.stringify({date:`${date}` ,tasks: [] }, null, 2));
    }
    if (!fs.existsSync(listsFilePath)) {
        // 文件不存在时，创建并初始化为空数组
        fs.writeFileSync(listsFilePath, JSON.stringify({dates: [date] }, null, 2));
    }
}

// 路由：获取当天任务列表
app.get('/tasks/:date', (req, res) => {
    const { date } = req.params; // 获取日期参数
    const filePath = path.join(__dirname, 'tasks', `${date}.json`); // 文件路径
    ensureTaskFileExists(date);
    // 读取文件
    fs.readFile(filePath, 'utf8', (err, fileContent) => {
        if (err && err.code === 'ENOENT') {
            // 如果文件不存在，返回空任务列表
            return res.status(200).json({ date, tasks: [] });
        } else if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to read tasks file' });
        }

        try {
            const tasksData = JSON.parse(fileContent); // 解析文件内容
            res.status(200).json(tasksData);
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ error: 'Invalid JSON format in tasks file' });
        }
    });
});

// 路由：更新任务状态
app.patch('/tasks/:date/:taskId', (req, res) => {
    const { date, taskId } = req.params; // 获取日期和任务 ID
    const { status } = req.body; // 获取新的任务状态

    if (!status) {
        return res.status(400).json({ error: 'Missing required field: status' });
    }

    const filePath = path.join(__dirname, 'tasks', `${date}.json`); // 文件路径
    fs.readFile(filePath, 'utf8', (readErr, fileContent) => {
        if (readErr && readErr.code === 'ENOENT') {
            alert("task not found");
            return res.status(404).json({ error: 'Tasks file not found' });
        } else if (readErr) {
            console.error('Error reading file:', readErr);
            return res.status(500).json({ error: 'Failed to read tasks file' });
        }

        let tasksData;
        try {
            tasksData = JSON.parse(fileContent); // 解析现有文件内容
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            return res.status(500).json({ error: 'Invalid JSON format in tasks file' });
        }

        // 查找并更新任务状态
        const task = tasksData.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = status;
            fs.writeFile(filePath, JSON.stringify(tasksData, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to file:', writeErr);
                    return res.status(500).json({ error: 'Failed to update tasks file' });
                }
                res.status(200).json({ message: 'Task status updated successfully', task });
            });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
