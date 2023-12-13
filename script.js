$(document).ready(function() {
    var displayer = $("#resultDisplayer");
    var cliper = $("#cliper"),$hiddenInput = $("#hiddenInput"), renamingInput = ".rename";
    var device = false;
    device = $(document).width() <= 1000 ? true: false;
    //<- calculator functions
    var opeOutput = {
        name:"",
        equation:[],
        result:"" 
    }
    //<- calc output
    var mathOperators = {
        "*": function(a, b) {
           return a * b;
        },
        "/": function(a, b) {
           return a / b;
        },
        "%": function(a, b) {
           return a * 100 / b;
        },
        "-": function(a, b) {
           return a - b;
        }
    };
    function solveOperation(str) {
       str = str + "";
       var opeArr = str.match(/(?:-?\d+(?:\.\d+)?)|(\/|\*|\-|\%|\d+)/g);//arr with every operation/number
       var intArr = opeArr.map(function(current) { //parse to integrer
         if (current.indexOf(".") !== -1) { //handle float 
             return current = parseFloat(current);
         }
         return current = parseInt(current);
       });
       function math(operators, operand) { 
           for (var property in mathOperators) {
               while (operators.indexOf(property) > -1) {
                   var index = operators.indexOf(property);
                   var result = mathOperators[property](operand[index - 1], operand[index + 1]);
                   operand.splice(index - 1, 3, result);
                   operators.splice(index - 1, 3, result + "");
               }
           }
           return operand.reduce(function (a, b) {
               return a + b;
           });
       }
       return math(opeArr, intArr);
    }
    function getLocalClips() { 
        if (!localStorage.calculatorApp || localStorage.calculatorApp === "{}") {
            return;
        }
        var myObj = JSON.parse(localStorage.calculatorApp);
        for (var keys in myObj) {
            $("<div/>").addClass("clip")
            .attr("id", keys).append(
                $("<li/>").text(`${myObj[keys].formula} =  ${myObj[keys].result}`)
                .attr("data-myResult", myObj[keys].result)
                .prepend(
                    $("<h4/>").text(myObj[keys].name)
                ),
                $("<i/>").addClass("material-icons clip-btn")
                .text("edit").attr("id", "editIcon"),
                $("<span/>").text("x").addClass("clip-btn")
            ).appendTo("#clipBoard");
        }
    }
    getLocalClips();
    //<- storing clipboard information in localStorage
    $hiddenInput.on("keypress", function(e) { //click calc buttons when keypressed
        var key = e.keyCode;
        var keyId = "#keyCode" + key;
        $(keyId).click();  
    })
    
    $(".button").on("click", function() {
        var buttonVal = this.value;
        var displayVal = opeOutput.result;
        //
        if (buttonVal == "="){
            opeOutput.result = solveOperation(opeOutput.result);
            $("#equationDisplayer").text(opeOutput.equation[opeOutput.equation.length - 1]);
            displayer.text(opeOutput.result);
            return;
        }
        if (buttonVal == "AC") {
            $("#equationDisplayer").text("0");
            displayer.text("0");
            opeOutput.equation = [];
            opeOutput.result = "";
            return;
        }
        if (buttonVal == "CE") {
            if (opeOutput.equation.length === 0) {
                return
            }
            if (opeOutput.equation.length === 1) {
                $("#equationDisplayer").text("0");
                displayer.text("0");
                opeOutput.equation = [];
                opeOutput.result = "";
                return;
            }
            opeOutput.equation.pop();
            opeOutput.result = opeOutput.equation[opeOutput.equation.length - 1];
            $("#equationDisplayer").text(opeOutput.equation[opeOutput.equation.length - 1])
            displayer.text(opeOutput.result)
            return 
        }
        opeOutput.result = displayVal + buttonVal;
        opeOutput.equation.push(opeOutput.result);
        displayer.text(opeOutput.result);
    });
    function setStoredClip(clip, id) {
        var myObj = {};
        if (!localStorage.calculatorApp || localStorage.calculatorApp === "{}") {
            myObj[id] = clip;
            myObj = JSON.stringify(myObj);
            localStorage.calculatorApp = myObj;
            return;
        }
        myObj = JSON.parse(localStorage.calculatorApp);
        myObj[id] = clip;
        myObj = JSON.stringify(myObj);
        localStorage.calculatorApp = myObj;
    }
    cliper.on("click", function() {
        var operation = opeOutput.equation[opeOutput.equation.length - 1] 
        var opeResult = solveOperation(opeOutput.result);
        var opeId = "Clip" + Math.floor(Math.random() * 100);
        var clip = {
            name: "Edit me!",
            formula: operation,
            result: opeResult,
        }
        if (opeOutput.name !== ("")) {
            clip.name = opeOutput.name;
        }
        setStoredClip(clip, opeId);
        $(".clip").remove();
        getLocalClips();
        opeOutput.name = "";
    });
    //<- app to store information on users wishes.
    $("#nameClip").on("click", function() {
        var elem = $(this);
        elem.hide();
        elem.after(
            $("<form/>").append(
                $("<input/>").addClass("rename")
            )
        );
        $(renamingInput).focus();
        function evenConditional(inputElem) {
            if (inputElem.val() !== "") {
                elem.text(inputElem.val())
                opeOutput.name = inputElem.val();
            }
            inputElem.parent().remove();
            elem.show();
        }
        $(renamingInput).blur(function() {
            evenConditional($(renamingInput));
        });
        $(renamingInput).closest("form").on("submit", function(e) {
           e.preventDefault();
           evenConditional($(renamingInput));
        });
    });
    $("#clipBoard").on("click", ".clip #editIcon", function() {
        var parent = $(this).closest("div");
        var parentId = parent.attr("id");
        var elem = parent.find("h4");
        var myObj = JSON.parse(localStorage.calculatorApp);
        var parentLocStorObj = myObj[parentId];
        elem.hide();
        elem.after(
            $("<form/>").append(
                $("<input/>").addClass("rename")
            )
        );
        $(renamingInput).focus();
        function evenConditional(id) {
            if ($(id).val() !== "") {
                elem.text($(id).val())
                parentLocStorObj.name = $(id).val();
                setStoredClip(parentLocStorObj, parentId);
            }
            id.remove();
            elem.show();
            if (!device) {
                $hiddenInput.focus();
            }
        }
        $(renamingInput).blur(function() {
            evenConditional(this);
        });
        $(".clip form").on("submit", function(e) {
           evenConditional(this);
           e.preventDefault();
        });
    });
    $("#clipBoard").on("click", ".clip li",  function () {
        var thisResult = $(this).data("myresult");
        displayer.text(`${thisResult}`);
        opeOutput.equation.push(`${thisResult}`);
        opeOutput.result = `${thisResult}`;
    });
    $(".container").on("click", function(e) {
        if (e.target === $("#nameClip")[0] || e.target === $("#editIcon")[0] || device) {
            return
        }
        $hiddenInput.focus();
    });
    //<- changes the title of the data stored 
    $(document).on("click", ".clip span", function() {
        var parentId = $(this).closest("div").attr("id");
        var myObj = JSON.parse(localStorage.calculatorApp);
        delete myObj[parentId];
        localStorage.calculatorApp = JSON.stringify(myObj);
        $("#" + parentId).remove();
    });
});