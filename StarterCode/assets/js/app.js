// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;


var margin = {
    top: 20, 
    right: 40, 
    bottom: 80, 
    left: 100
};

var width = svgWidth - margin.left - margin.right; 
var height = svgHeight - margin.top - margin.bottom; 

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)

// Append an SVG group 
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params

var chosenXAxis = "poverty"

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis){
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8, 
    d3.max(stateData, d=>d[chosenXAxis]) * 1.2
])
.range([0,width]);

return xLinearScale
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale); 

    xAxis.transition()
         .duration(1000)
         .call(bottomAxis)
    return xAxis
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale,chosenXAxis){
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    
    return circlesGroup
}

// function used for updating circles group with new tooltip

function updateToolTip(chosenXAxis, circlesGroup){
    var label; 
    
    if(chosenXAxis === "poverty"){
        label = "Poverty Rate"

    } else if (chosenXAxis === "age"){ 
        label = "Age"

    }
    else {
        label = "Household Income"
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80,-60])
        .html(function(d){
            return(`${d.state}<br>${label}${d[chosenXAxis]}`);
        })
    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function(data){
        toolTip.show(data)
    })
    .on("mouseout", function(data,index){
        toolTip.hide(data)
    })
return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(stateData,err){
    if (err) throw err; 
console.log(stateData)
  // parse data

stateData.forEach(function(data){
    data.poverty = +data.poverty
    data.age = +data.age
    data.income = +data.income
    data.obesity = +data.obesity
})

// xLinearScale function above csv import
var xLinearScale = xScale(stateData, chosenXAxis);

// Create y scale function 

var yLinearScale = d3.scaleLinear()
    .domain([0,d3.max(stateData, d=> d.obesity)])
    .range([height,0])

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

//append x axis

var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0,${height})`)
    .call(bottomAxis)

//append y axis 

chartGroup.append("g")
    .call(leftAxis)

//append initial circles

var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d=> yLinearScale(d.obesity))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5");

// Create group for three x-axis labels
var labelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width/2}, ${height + 20} )`);

var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("Poverty")

var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("active", true)
    .text("Age")

var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("active", true)
    .text("Income")

// append y axis
chartGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin.left)
.attr("x", 0 - (height / 2))
.attr("dy", "1em")
.classed("axis-text", true)
.text("Obesity");

// updateToolTip function above csv import 
var circlesGroup = updateToolTip(chosenXAxis,circlesGroup);

// x axis labels event listener
labelsGroup.selectAll("text")
    .on("click", function(){

        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis){

            chosenXAxis = value

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        xAxis= renderAxes(xLinearScale, xAxis);

        circlesGroup= renderCircles(circlesGroup, xLinearScale, chosenXAxis)

        circlesGroup = updateToolTip(chosenXAxis,circlesGroup);

        
        if (chosenXAxis === "poverty"){
            povertyLabel
            .classed("active", true)
            .classed("inactive",false)
            ageLabel
            .classed("active", false)
            .classed("inactive",true)

            incomeLabel
            .classed("active", false)
            .classed("inactive", true)

        }
        else if (chosenXAxis==="age"){
            ageLabel
            .classed("active", true)
            .classed("inactive", false)

            povertyLabel
            .classed("active", false)
            .classed("inactive", true)

            incomeLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else{
            ageLabel
            .classed("active", false)
            .classed("inactive", true)

            povertyLabel
            .classed("active", false)
            .classed("inactive", true)

            incomeLabel
            .classed("active", true)
            .classed("inactive", false)


        }
    }
    })
 
}).catch(function(error){
    console.log(error)
})