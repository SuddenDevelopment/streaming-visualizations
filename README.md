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
