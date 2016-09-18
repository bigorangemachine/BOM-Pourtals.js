# c0redP.js

This is a placeholder.  I need to write an async tasker.  c0redP (Core-P aka Personality Core)

## API
-----------

### c0re

* `c0re(` **success_callback** *(function)*, **failed_callback** *(function)*, **options** *(object)* `)`: *returns* `c0re instance`

  **Constructor Function**

  `success_callback` The callback to be executed when the queue is considered to be completed successfully.  This is affected by `options.determinative`

  `failed_callback` The callback to be executed when the queue is considered to be completed unsuccessfully.  This is affected by `options.determinative`

  `options` contains settings. Refer to 'Properties' below.

  **Example**: `myc0re = new c0re(function(argIn){}, function(argIn){}, {'cycle_type':'pool', 'tasker_type': 'iterator','pool_size': 20});`

* `c0re.has(` **key** *(string)* `)`: *returns* `boolean [true|false]`

#### c0redP - Properties

* `determinative`: *readonly* `string ['all'|'~all'|'pos']` **default** `all`

  **Completion Determinative**

  `determinative` helps determine what threshold of successful calls to execute the `success_callback` or `failed_callback`

  * `all` when success rate is 100%

  * `~all` when success rate is not 0%

  * `pos` when success rate is greater than failure rate

* `queue`: *readonly* `array [ ` **c0reModel** `]`

  **Callback Queue**

  `queue` contains a list of models `c0reModel`.

* `temp_queue`: *readonly* `array [ ` **c0reModel** `]`

  **Temporary Queue**

  `temp_queue` contains a list of models `c0reModel`.  This jumps to the head of the `queue` and can only be accessed internally with `enqueue_once()`


* `silent`: *readonly* `boolean [true|false]` **default** `false`

  **Silent Mode**

  `silent` if true enable extra warnings & debugging

* `pool_size`: *special-readonly* `number [>1]` **default** `1`

  **Pool Size**

  `pool_size` variable is readonly but can be changed with `set_pool()`.  It changes async (in its own task queue).  If `cycle_type` is '*queue*' then it cannot be changed.  Number must be greater than 1.

* `fps_readonly`: *readonly* `boolean [true|false]` **default** `true`

  **FPS Setting is Readonly**

  `fps_readonly` determines if the `c0redP.fps` can be changed (below).

* `fps`: *special-readonly* `number [>1]` **default** `15`

  **Frames Per Second**

  `fps` determines the frames per second target.

* `cycle_type`: *readonly* `string ['iterator'|'generator']` **default** `iterator`

  **Cycle Type**

  `cycle_type` determines the frames per second target.

  * `iterator` Once completed it will stop

  * `generator` Once completed it will reset and run again

* `tasker_type`: *readonly* `string ['queue'|'pool'|'fuzzy']` **default** `queue`

  **Tasker Type**

  `tasker_type` determines how the tasks are ran.

  * `queue` forces the `options.pool_size` to always be one forcing tasks to be completed in sequence

  * `pool` allows for a number to tasks to be active based on the `options.pool_size` variable

  * `fuzzy` (WIP) not currently supported.  Allows for idle task management

* `large_cycle`: *readonly* `object`

  **Large Cycle**

  `large_cycle`  is similar to `small_cycle` (below). (Coming Soon)

  * `id` aka. task/cycle id (the id returned from `setTimeout()`, `setImmediate()`, `requestAnimationFrame()` or `setInterval()`)

* `small_cycle`: *readonly* `object`

  **Small Cycle**

  `small_cycle` is similar to `large_cycle` (refer above). (Coming Soon)

* `unique_prefix`: *readonly* `string`

  **Unique Prefix**

  `unique_prefix` passes through to `c0reModel` options


### c0redP

* `c0redP(` **options** *(object)* `)`: *returns* `c0redP instance`

  **Constructor Function**

  `options` contains index keys of the initial set of callbacks. All `options` callbacks are both pass through `c0redP.register()` and `c0redP.add()`

  `root` *(optional)* the default 'this' when using ES5 `function.apply(this,[]);` (first argument in `function.apply`) when used in `c0redP.icallback()`.

  **Example**: `myc0redP = new c0redP({'init':function(argIn){}, 'destroy':function(argIn){}}, this);`



### c0re

[ ] init

  Suggested not required!

[ ] ready

  Suggested not required!

[ ] start

  Required!

[ ] exit

  Suggested not required!

[ ] bind - (low priority) data-binding
