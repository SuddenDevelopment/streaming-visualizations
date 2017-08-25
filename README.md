# streaming-visualizations
a normalized data stream to visualization library

## Data Format

ts is used for a js timestamp in a data object. The collection should stay sorted by ts so that it can be effeciently trimmed by time

```javascript

arrData=[
  {
     ts:1234567890
    ,x:
    ,y:
    ,cat:
    ,val:
    ,src:{}
    ,dest:{}
  }
];

```

## Functions

- render
- addData
- prune

## Chart Types

1. Globe
1. Map
1. Parallel Coordinates
1. Scatter plot
1. Network map
1. Polar / radar plot
1. Particle Field
1. 3d ascii model?

## References

https://syntagmatic.github.io/parallel-coordinates/
http://gojs.net/latest/extensions/PortShifting.html
http://visjs.org/showcase/projects/theantworks/
http://visjs.org/index.html#modules
http://js.cytoscape.org/
http://processingjs.org/exhibition/
https://github.com/AnalyticalGraphicsInc/cesium/
https://github.com/biovisualize/micropolar/

https://github.com/datacratic/data-projector
https://github.com/twitterdev/twitter-stream-globe
https://github.com/chriz3dd/WebGLGraph
http://particle-love.com/
https://robertsspaceindustries.com/starmap
http://codeology.braintreepayments.com/featured
