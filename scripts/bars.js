
function iniciateBar(div,val){
    let temp_graph = document.getElementById(div)
    var bar = new ProgressBar.SemiCircle(temp_graph, {
    strokeWidth: 6,
    color: '#FFEA82',
    trailColor: '#eee',
    trailWidth: 1,
    easing: 'easeInOut',
    duration: 800,
    svgStyle: null,
    text: {
    fontSize:'1px',
    value: '',
    alignToBottom: false
    },
    from: {color: '#3399ff'},
    to: {color: '#ED6A5A'},
    // Set default step function for all animate calls
    step: (state, bar) => {
    bar.path.setAttribute('stroke', state.color);
    var value = Math.round(bar.value() * 100);
    if (value === 0) {
        bar.setText('');
    } else {
        bar.setText(value);
    }

    bar.text.style.color = state.color;
    }
    });
    bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    bar.text.style.fontSize = '14px';
    bar.animate(val/100)

    return bar
}