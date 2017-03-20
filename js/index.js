(function () {
    var svg = d3.select('svg');
    var deltaMargin = 20;
    var mainCircleDiameter = 700;

    var g = renderMainCircle();
    var color = interpolateColor();
    var pack = generatePack();

    d3.json('db/skills.json', function(error, root) {
        if (error) {
            throw error;
        }

        root = d3.hierarchy(root)
            .sum(function(d) {
                return d.size || randomInteger(500, 7000)
            })
            .sort(function(a, b) {
                return b.value - a.value;
            });

        var focus = root;

        // descendants генерирует массив потомков
        var nodes = pack(root).descendants();
        var view;

        // формирование ноды - круга
        var circle = g.selectAll('circle')
            .data(nodes)
            .enter()
            // добавляет окружность
            .append('circle')
            // определяет, какой класс приписать в зависимости от вложенности
            .attr('class', function(d) {
                if (d.parent) {
                    return d.children ? 'node' : 'node node--leaf';
                }
                return 'node node--root';
            })
            // закраска окружности
            .style('fill', function(d) {
                return d.children ? color(d.depth) : null;
            })
            // колбек на клик по ноде
            .on('click', function(d) {
                if (focus !== d) {
                    zoom(d);
                    d3.event.stopPropagation();
                } else {
                    console.log(d);
                    console.log('click here in else');
                }
            });

        // формирование ноды - текста
        var text = g.selectAll('text')
            .data(nodes)
            .enter()
            .append('text')
            .attr('class', 'label')
            .style('fill-opacity', function(d) {
                return d.parent === root ? 1 : 0;
            })
            .style('display', function(d) {
                return d.parent === root ? 'inline' : 'none';
            })
            .text(function(d) {
                return d.data.name;
            });

        var node = g.selectAll('circle,text');

        svg
            .style('background', color(-1))
            .on('click', function() {
                zoom(root);
            });

        zoomTo([root.x, root.y, root.r * 2 + deltaMargin]);

        function zoom(d) {
            focus = d;

            var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween('zoom', function() {
                    return function(t) {
                        zoomTo(
                            d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + deltaMargin])(t)
                        );
                    };
                });

            transition.selectAll('text')
                .filter(function(d) {
                    return d.parent === focus || this.style.display === 'inline';
                })
                .style('fill-opacity', function(d) {
                    return d.parent === focus ? 1 : 0;
                })
                .on('start', function(d) {
                    if (d.parent === focus) {
                        this.style.display = 'inline';
                    }
                })
                .on('end', function(d) {
                    if (d.parent !== focus) {
                        this.style.display = 'none';
                    }
                });
        }

        function zoomTo(v) {
            var k = mainCircleDiameter / v[2];
            view = v;
            node.attr('transform', function(d) {
                var translateX = (d.x - v[0]) * k;
                var translateY = (d.y - v[1]) * k;
                return `translate(${translateX}, ${translateY})`;
            });
            circle.attr('r', function(d) {
                return d.r * k;
            });
        }
    });

    /**
     * Генерирует случайное число от min до max
     * @param {number} min
     * @param {number} max
     * @return {number}
     */
    function randomInteger(min, max) {
        var rand = min + Math.random() * (max - min);
        rand = Math.round(rand);
        return rand;
    }

    /**
     * Отрисовывает основной круг
     * @return {*}
     */
    function renderMainCircle() {
        var circleRadius = mainCircleDiameter / 2;
        return svg.append('g')
            .attr('transform', `translate(${circleRadius}, ${circleRadius})`);
    }

    /**
     * Создает функцию генерации цвета для каждой группы кругов
     * @return {*}
     */
    function interpolateColor() {
        return d3.scaleLinear()
            .domain([-1, 5])
            .range(['hsl(152,80%,80%)', 'hsl(228,30%,40%)'])
            .interpolate(d3.interpolateHcl)
    }

    /**
     * Создает новый круговой лайаут, основу
     * @return {*}
     */
    function generatePack() {
        var diameter = mainCircleDiameter - deltaMargin;
        return d3.pack()
            .size([diameter, diameter])
            .padding(2);
    }
}());
