/**
 * Created by namuha on 5/29/17.
 */
//Really ugly SVG string to help with creating task graphics with text specified by user
var postItSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Layer_1" x="0px" y="0px" ' +
    'viewBox="0 0 491.52 491.52" style="enable-background:new 0 0 491.52 491.52;" xml:space="preserve">' +
        '<g id="post-it-container" transform="matrix(1 0 0 1 0 0)">' +
            '<rect y="79.757" style="fill:#F6C358;" width="491.52" height="411.75"/>' +
            '<rect y="0.013" style="fill:#FCD462;" width="491.52" height="411.75"/>' +
            '<polygon style="fill:#F6C358;" points="384.213,411.787 491.52,304.481 384.213,304.481 "/>' +
        '</g>' +
    '</svg>';

//Global Vars
var draggedTask = null; //Keep Track of Task Drag
var taskColumns = [];


//Helper function for creating subclasses
function inheritPrototype(childObj, parentObj) {
    var copyOfParent = Object.create(parentObj.prototype);
    copyOfParent.constructor = childObj;
    childObj.prototype = copyOfParent;
}

//Begin class declarations
function Column(tasks, domNode, colID) {
    this.tasks = tasks;
    this.node = domNode;
    this.colID = colID;
    this.taskNums = 0;
}

Column.prototype = {
    appendTask: function (task) {
        this.taskNums++;
        task.setTaskPos(this.taskNums);
        task.setCurrentColumn(this);
        this.tasks.push(task);
    }, 
    removeTask: function (task) {
        this.taskNums--;
        this.tasks.splice(task.getTaskPos() - 1, 1);
    },
    getTask: function (taskID) {
        var task = null;
        for(var i = 0; i < this.tasks.length; i++){
            if (taskID === this.tasks[i].getTaskID())
                task = this.tasks[i];
        }
        return task;
    },
    getNode: function () {
        return this.node;
    },
    getColID: function () {
        return this.colID;
    }
};

function Task(taskName, details, priority, dueDate, domNode) {
    this.taskName = taskName;
    this.details = details;
    this.priority = priority;
    this.dueDate = dueDate;
    this.node = domNode;
    this.taskID = taskName.split(' ').join('-');
}

Task.prototype = {
    setTaskName: function (taskName) {
        this.taskName = taskName;
    },
    getTaskName: function () {
        return this.taskName;
    },
    setDetails: function (details) {
        this.details = details;
    },
    getDetails: function () {
       return this.details;
    },
    setPriority: function (priority) {
        this.priority = priority;
    },
    getPriority: function () {
        return this.priority;
    },
    setDueDate: function (dueDate) {
        this.dueDate = dueDate;
    },
    getDueDate: function () {
        return this.dueDate;
    },
    getTaskID: function () {
        return this.taskID;
    },
    setTaskPos: function (taskPos) {
        this.taskPos = taskPos;
    },
    getTaskPos: function () {
        return this.taskPos;
    },
    setNode: function (domNode) {
        this.node = domNode;
    },
    getNode: function () {
        return this.node;
    }
}

function MainTask(taskName, details, priority, dueDate, category, dateCategory, recurring, currentColumn, subTasks, domNode) {
    Task.call(this, taskName, details, priority, dueDate, domNode);
    this.category = category;
    this.dateCategory = dateCategory;
    this.recurring = recurring;
    this.currentColumn = currentColumn;
    this.subTasks = subTasks;
}

inheritPrototype(MainTask, Task);

MainTask.prototype.setCategory = function(category) {
    this.category = category;
};

MainTask.prototype.getCategory = function() {
    return this.category;
};

MainTask.prototype.setDateCategory = function(dateCategory) {
    this.dateCategory = dateCategory;
};

MainTask.prototype.getDateCategory = function() {
    return this.dateCategory;
};

MainTask.prototype.setRecurring = function (recurring) {
    this.recurring = recurring;
};

MainTask.prototype.getRecurring = function () {
    return this.recurring;
};

MainTask.prototype.setCurrentColumn = function (currentColumn) {
    this.currentColumn = currentColumn;
};

MainTask.prototype.getCurrentColumn = function () {
    return this.currentColumn;
};

MainTask.prototype.setSubTasks = function (subTasks) {
    this.subTasks = subTasks;
};

MainTask.prototype.getSubTasks = function () {
    return this.subTasks;
};


function SubTask(taskName, details, priority, dueDate, domNode) {
    Task.call(this, taskName, details, priority, dueDate, domNode);
}

inheritPrototype(SubTask, Task);
//End class declarations

//Function declarations
function showModal () {
    $('#myModal').modal();
}

function handleDragStart(evt) {
    var taskSVG = this.nextElementSibling;
    draggedTask = taskCheck(taskSVG.parentElement.id);
    taskSVG.setAttributeNS(null, "opacity", "0.4");
    var dragIcon = document.createElement('img');
    dragIcon.src = "icons/post-it.svg";
    dragIcon.width = 100;
    evt.dataTransfer.setDragImage(dragIcon, -10, -10);
    evt.dataTransfer.setData('text', taskSVG.parentElement.innerHTML);
}

function handleDragOver(evt) {
    evt.preventDefault();

    evt.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

    return false;
}

function handleDrop(evt) {
    evt.preventDefault();
    if (evt.stopPropagation) {
        evt.stopPropagation();
    }

    var colID = parseInt(this.id.split('-')[1]);
    var dropColumn = taskColumns[colID];

    draggedTask.getCurrentColumn().removeTask(draggedTask);

    dropColumn.appendTask(draggedTask);
    dropColumn.getNode().appendChild(draggedTask.getNode());

    var taskSVG = draggedTask.getNode().firstElementChild.nextElementSibling;
    taskSVG.setAttributeNS(null, "opacity", "1");

    return false;
}

function taskCheck (taskID) {
    var returnTask = null;
    for (var i = 0; i < taskColumns.length; i++) {
        if (taskColumns[i].getTask(taskID) !== null)
            returnTask = taskColumns[i].getTask(taskID);
    }
    return returnTask;
}

function createWrap(textToWrap, svgTextNode, svgEl, isCenter) {
    var svgWidth = svgEl.getBoundingClientRect().width;
    var words = textToWrap.split(' ');
    var svgTSpanNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    svgTSpanNode.setAttribute("font-size", "35");
    svgTSpanNode.setAttribute("fill", "black");
    svgTSpanNode.setAttribute('dy', '35');
    if (isCenter === true) {
        svgTSpanNode.setAttribute("text-anchor", "middle");
        svgTSpanNode.setAttributeNS(null, 'x', '245.76');
    } else {
        svgTSpanNode.setAttributeNS(null, 'x', '15');
    }
    var textNode = document.createTextNode(words[0]);
    svgTSpanNode.appendChild(textNode);
    svgTextNode.appendChild(svgTSpanNode);
    if (words.length > 1) {
        for (var i = 1; i < words.length; i++) {
            var len = svgTSpanNode.firstChild.data.length;
            svgTSpanNode.firstChild.data += " " + words[i];

            if (svgTSpanNode.getBoundingClientRect().width > svgWidth) {
                svgTSpanNode.firstChild.data = svgTSpanNode.firstChild.data.slice(0, len);
                var svgTSpanNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                svgTSpanNode.setAttribute("font-size", "35");
                svgTSpanNode.setAttribute("fill", "black");
                var textNode = document.createTextNode(words[i]);
                svgTSpanNode.appendChild(textNode);
                svgTextNode.appendChild(svgTSpanNode);
                svgTSpanNode.setAttributeNS(null, 'dy', '35');
                if (isCenter === true) {
                    svgTSpanNode.setAttribute("text-anchor", "middle");
                    svgTSpanNode.setAttributeNS(null, 'x', '245.76');
                } else {
                    svgTSpanNode.setAttributeNS(null, 'x', '15');
                }
            }
        }
    }
}

function addTask () {
    var taskName = document.getElementById("name").value;
    var taskDetails = document.getElementById("details").value;
    var taskColumn1 = document.getElementsByClassName("tasks")[0];
    var taskColumn2 = document.getElementsByClassName("tasks")[1];
    var taskImgCount1 = taskColumn1.getElementsByTagName("svg").length;
    var taskImgCount2 = taskColumn2.getElementsByTagName("svg").length;
    var taskContainer = document.createElement('div');
    var taskOverlay = document.createElement('div');

    var parser = new DOMParser(),
        doc = parser.parseFromString(postItSVG, "image/svg+xml");

    if(taskImgCount1 < 4) {
        taskColumn1.appendChild(taskContainer);
        taskContainer.appendChild(taskOverlay);

        taskOverlay.classList.add("task-overlay");
        taskOverlay.classList.add("draggable");
        taskOverlay.setAttribute('draggable', 'true');
        taskOverlay.addEventListener('dragstart', handleDragStart);

        var svgEl = taskContainer.appendChild(document.adoptNode(doc.documentElement));
        svgEl.classList.add("task");

        var taskNameNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        var gEl = svgEl.getElementsByTagName("g")[0];
        gEl.appendChild(taskNameNode);

        createWrap(taskName, taskNameNode, svgEl, true);

        var taskDetailsNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        var taskDetailsY = taskNameNode.getBoundingClientRect().height + 35; 
        taskDetailsNode.setAttributeNS(null, 'y', taskDetailsY.toString());

        gEl.appendChild(taskDetailsNode);

        createWrap(taskDetails, taskDetailsNode, svgEl, false);

        var task = new MainTask(taskName, taskDetails, null, null, null, null, null, taskColumns[0], null, taskContainer);
        taskContainer.id = task.getTaskID();
        taskColumns[0].appendTask(task);
        taskContainer.id = task.getTaskID();
    } else if (taskImgCount2 < 4) {
        taskColumn2.appendChild(taskContainer);
        taskContainer.appendChild(taskOverlay);

        taskOverlay.classList.add("task-overlay");
        taskOverlay.classList.add("draggable");
        taskOverlay.setAttribute('draggable', 'true');

        var svgEl = taskContainer.appendChild(document.adoptNode(doc.documentElement));
        svgEl.classList.add("task");

        var taskNameNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        var gEl = svgEl.getElementsByTagName("g")[0];
        // gEl.addEventListener("mousedown", selectTaskEl);
        gEl.appendChild(taskNameNode);

        createWrap(taskName, taskNameNode, svgEl, true);

        var taskDetailsNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        var taskDetailsY = taskNameNode.getBoundingClientRect().height + 35; 
        taskDetailsNode.setAttributeNS(null, 'y', taskDetailsY.toString());

        gEl.appendChild(taskDetailsNode);

        createWrap(taskDetails, taskDetailsNode, svgEl, false);

        var task = new MainTask(taskName, taskDetails, null, null, null, null, null, taskColumns[1], null, taskContainer);
        taskContainer.id = task.getTaskID();
        taskColumns[1].appendTask(task);
        taskContainer.id = task.getTaskID();
    }

    var taskForm = $('#task-form');
    taskForm.submit(function() { return false; });
    taskForm[0].reset();
    $('#myModal').modal("toggle");
}

(function createColumns () {
    var taskColumnNodes = document.getElementsByClassName("tasks");

    for (var i = 0; i < taskColumnNodes.length; i++) {
        taskColumnNodes[i].addEventListener('drop', handleDrop);
        taskColumnNodes[i].addEventListener('dragover', handleDragOver);

        taskColumnNodes[i].id = "column-" + i;

        var col = new Column(new Array(), taskColumnNodes[i], i);
        taskColumns.push(col);
    }
})();
//End function declarations

//Add event listeners to elements
var addTaskBtn = document.getElementById("add-icon");
addTaskBtn.addEventListener("click", showModal);

var addTaskModal = document.getElementById("add-task");
addTaskModal.addEventListener("click", addTask);