# Class

# Function

## `decodeTxData()`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

## `convertBadgeIdsToHex(param: Array<string>, param: number)`

Convert the badgeIds into hex strings, so we can use them in the event filters

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| param | Array<string> |  | array of badges. |
| param | number |  | value to pad left by. |

## `determineStartBlock()`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

## `initializeBadges()`

Functions that need reference to closed over badge context ETHEREUM EVENT LOG PARALLELIZER instead of linearly going through ethereum and looking at the event logs of each block we go through many chunks of ethereum at the same time, and then join the results together This is for performance optimization: Instead of one call to `getPastEvents`, which looks like: [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] ^ c h e c k o n e b l o c k a t a t i m e start end We do many chunks at the same time, where blocks are checked linearly in each chunk: [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] |-------------||-------------||-------------||-------------||-------------||-------| ^ ^^ ^^ ^^ ^^ ^^ ^ blockIncrement blockIncrement blockIncrement blockIncrement blockIncrement finalIncrement Now, 6 simulataneous calls were made to `getPastEvents`, which is still O(n) time complexity but could make a significant difference in the future when ethereum gets extremely long

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |