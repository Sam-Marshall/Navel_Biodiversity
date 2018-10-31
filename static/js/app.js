function buildMetadata(sample) {

    d3.json('/metadata/' + sample).then((d, i) => {
        // Reference to the div where metadata will be placed
        var metaDiv = d3.select('#sample-metadata');
        metaDiv.html("");
        Object.entries(d).forEach((d, i) => {
            metaDiv.append('p').text(d[0] + ': ' + d[1]);
        });

        var WFREQ = d['WFREQ'];

        // Trig to calc meter point
        var degrees = (9 - WFREQ) * 20,
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX, space, pathY, pathEnd);
        console.log(WFREQ);
        console.log(degrees);

        var guageData = [{
                type: 'scatter',
                x: [0],
                y: [0],
                marker: { size: 28, color: '850000' },
                showlegend: false,
                name: 'WFREQ',
                text: WFREQ,
                hoverinfo: 'none'
            },
            {
                values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
                rotation: 90,
                text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ' '],
                textinfo: 'text',
                textposition: 'inside',
                marker: {
                    colors: ['rgb(132,181,137)', 'rgb(137,188,142)',
                        'rgb(139,192,134)', 'rgb(183,205,143)',
                        'rgb(213,229,154)', 'rgb(229,231,176)',
                        'rgb(234,231,197)', 'rgb(244,241,228)',
                        'rgb(248,243,236)', 'rgba(255, 255, 255, 0)'
                    ]
                },
                labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ' '],
                hoverinfo: 'none',
                hole: .5,
                type: 'pie',
                showlegend: false
            }
        ];

        var layout = {
            shapes: [{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }],
            title: 'Belly Button Washing Frequency',
            height: '100%',
            width: '100%',
            xaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-1, 1]
            },
            yaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-1, 1]
            }
        };

        Plotly.newPlot('gauge', guageData, layout);
    });

}

function buildCharts(sample) {

    d3.json('/samples/' + sample).then((d, i) => {

        var data = []
        var otu_ids = d.otu_ids;
        var otu_labels = d.otu_labels;
        var sample_values = d.sample_values;
        otu_ids.forEach((d, i) => {
            var info = {
                'otu_id': d,
                'otu_label': otu_labels[i],
                'sample_value': sample_values[i]
            }
            data.push(info);
        });
        data.sort((a, b) => {
            return (b['sample_value'] - a['sample_value']);
        });
        var topTen = data.slice(0, 10);

        //Building a Pie Chart showing the top ten represented samples
        var pieTrace = {
            values: topTen.map(d => d.sample_value),
            labels: topTen.map(d => d.otu_id),
            type: 'pie',
            hoverinfo: 'label'
        };
        var pieData = [pieTrace];

        var pieLayout = {
            title: 'Top Ten Bacteria OTU Present'
        };

        Plotly.newPlot('pie', pieData, pieLayout);

        //Building a Bubble Chart showing all samples and relative adundance
        var bubbleTrace = {
            x: data.map(d => d.otu_id),
            y: data.map(d => d.sample_value),
            text: data.map(d => d.otu_label),
            mode: 'markers',
            marker: {
                size: data.map(d => d.sample_value),
                color: data.map(d => d.otu_id)
            }
        }

        var bubbleData = [bubbleTrace];
        Plotly.newPlot('bubble', bubbleData);

    });
}

function init() {
    // Reference to the dropdown select element
    var selector = d3.select("#selDataset");

    // Using list of sample names to populate the select dropdown options
    d3.json("/names").then((sampleNames) => {
        sampleNames.forEach((sample) => {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });

        // Using the first sample from the list to build the initial plots
        const firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
    });

}

function optionChanged(newSample) {
    // Fetching new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
}

// Initializing the dashboard
init();