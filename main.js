/*
  Problem:
  
  In a normal array, removing an element at some index requires left-shifting all the subsequent elements. This takes O(n) time, and n/2 average (amortized) time, assuming uniform distribution in choosing of the index to remove. This can be extremely costly if the array size is huge.

  
  Solution:
  
  Instead of left-shifting everything immediately, the virtual indexing can delay real deletes and possibly reduce amortized time. When an element is removed, the subsequent elements are not left-shifted. Instead the only action is to mark the element as undefined (effectively removing the element), and adding the index to a virtual indexing table. A request for an element at some index i first passes through virtual index translation, to get a "real" index (that is hidden to the user).
  
  Example:
  > arr = [0, 1, 2, 3];
  > arr.remove(1);
  > arr;
  [0, undefined, 2, 3]
  > arr.get(1); // the virtual index 1 translates to real index 2
  2
  > arr.get(2);
  3

  One performance issue is that memory is required to keep track of the virtual index translation table. Another is that there is huge functional overhead.
  There are many ways to implement virtual index translation. The simplest (and possibly cost inefficient) is to keep a sorted linked list (which will never be greater than size k) of the indices that have been removed. Traversing this list will find the correct index, as follows:

  arr:      a = [0, undefined, undefined, 1, 2, undefined, 3, undefined, 4]
  removed:  r = [-1, 1, 2, 5, 7, 9] (9 is the end of the list, which is not removed but is necessary)
  size between undefineds:    [r[1] - r[0] - 1, r[2] - r[1] - 1, r[3] - r[2] - 1, r[4] - r[3] - 1, r[5] - r[4] - 1]
                            = [-1 - 1 - 1, 2 - 1 - 1, 5 - 2 - 1, 7 - 5 - 1, 9 - 7 - 1]
                            = [1, 0, 2, 1, 1]

  This is intuitive in that it is the same concept as skipping the undefineds while iterating through the array, and keeping track of the real index and the virtual index.
  A linear scan through a k sized linked list will take O(k) time, and k/2 amortized time. Notice that a linked list is easy to resize (since only pointers are used, whereas array resizing requires more allocation).
  
  Every time the size of the linked list exceeds k, a purge is necessary to reduce the size of the array by removing all of the undefined values. This is in order to reduce the overhead of index translation, as well as to reduce the waste of space. This will take O(n) time, but will happen only once in a while; the frequency can be determined by the usage of the array, such as how many get, set, push, pop, and remove requests are made. Especially for a get usage heavy array, minimizing translation overhead is especially necessary, so array purging (flattening) will need to happen more frequently. For a remove usage heavy array, index translation overhead might be less important.


  Conclusion:

  The overhead for virtual index translation is, for the general case, not worth it. However, for remove-heavy usecases, where array sizes are large and the distribution of indices to remove is uniform, this is surely an optimization to consider.
*/


log = console.log;

function Node(item)
{
    this.item = item;
    this.next = null;
}

function SortedList(arr)
{
    this.head = null;

    this.insert = function(item)
    {
        var nd = new Node(item);
        if (this.head == null) {
            this.head = nd;
        } else {
            var prv = null;
            var tmp = this.head;
            while (tmp != null)
            {
                if (tmp.item > item) {
                    if (tmp == this.head) {
                        this.head = nd;
                    } else {
                        prv.next = nd;
                    }
                    nd.next = tmp;
                    break;
                }
                prv = tmp;
                tmp = tmp.next;
            }
            if (nd.next == null) {
                prv.next = nd;
            }
        }
    }

    if (arr != undefined) {
        for (var i = 0; i < arr.length; i++)
        {
            this.insert(arr[i]);
        }
    }
}

function OptimizedRemoveArray()
{
    this.REFRESH_RATE = 10;

    var self = this;

    this.array = [];
    this.length = 0;

    var remove_count = 0;
    var removed = new SortedList();

    var is_int = function(index)
    {
        return index % 1 === 0;
    };

    var translate = function(index)
    {
        if (index >= self.length || index < 0 || !(is_int(index))) {
            throw new Error("Array index out of bounds");
        }

        var sum = 0;
        var tmp = removed.head;
        var prv_item = -1;
        while (true)
        {
            if (sum > index) {
                break;
            }
            if (tmp == null) {
                sum += self.length - prv_item - 1;
                prv_item = self.length;
                break;
            }
            sum += (tmp.item - prv_item - 1);

            prv_item = tmp.item;
            tmp = tmp.next;
        }

        var result = prv_item - (sum - index);

        return result;
    };

    var flatten = function()
    {
        remove_count = -1;
        removed = new SortedList();
        self.array = self.array.filter(function(elem)
        {
            return elem !== undefined;
        });
        self.length = self.array.length;
    };

    this.push = function(item)
    {
        var last_index = 1000000000;
        if (this.length > 0) {
            var last_index = translate(this.length - 1);
        }
        if (last_index + 1 < this.array.length) {
            this.array[last_index + 1] = item;
        } else {
            this.array.push(item);
        }
        this.length += 1;
        return item;
    };

    this.pop = function()
    {
        var last_index = translate(this.length - 1);
        return this.remove(last_index);
    };

    this.get = function(index)
    {
        var i = translate(index);
        return this.array[i];
    };

    this.remove = function(index)
    {
        var i = translate(index);
        var result = this.array[i];
        this.array[i] = undefined;
        removed.insert(i);
        this.length -= 1;

        if (remove_count == this.REFRESH_RATE) {
            flatten();
        }
        remove_count += 1;
        return result;
    };
}

function init_random_arrays(size)
{
    arr0 = new OptimizedRemoveArray();
    arr1 = [];
    var num;
    for (var i = 0; i < size; i++)
    {
        num = Math.random() * 100;
        arr0.push(num);
        arr1.push(num);
    }
    return [arr0, arr1];
}

/* returns true if the array outputs the same as a normal array */
function validation_test()
{
    var k = 100;
    var tmp = init_random_arrays(k);
    var arr0 = tmp[0];
    var arr1 = tmp[1];
    
    var rnd;
    var num;

    for (var i = 0; i < 1000; i++)
    {
        rnd = Math.random();
        if (rnd > 0.5) {
            num = Math.random() * 100;
            arr0.push(num);
            arr1.push(num);
        } else {
            var ind = Math.floor((Math.random() * (arr0.length - 1)) + 0);
            arr0.remove(ind);
            arr1.splice(ind, 1);
        }
        if (arr0.length != arr1.length) {return false;}
        for (var j = 0; j < arr0.length; j++)
        {
            if (arr0.get(j) != arr1[j]) {return false;}
        }
    }
    return true;
}

/* returns the time, in milliseconds, of running tests on each array */
function performance_test(arr0, arr1)
{
    k = 10000;
    var tmp = init_random_arrays(k);
    var arr0 = tmp[0];
    var arr1 = tmp[1];

    var accesses = [];
    var removes = [];
    var length = k;

    for (var i = 0; i < 10000; i++)
    {
        if (Math.random() > 0.5) {
            accesses.push("push");
            k += 1;
        } else {
            accesses.push("remove");
            k -= 1;
        }
        removes.push(Math.floor(Math.random() * k) + 0);
    }

    start = new Date().getTime();
    for (var i = 0; i < accesses.length; i++)
    {
        if (accesses[i] == "push") {
            arr0.push(-1);
        } else {
            arr0.remove(removes[i]);
        }
    }
    arr0_delta_t = new Date().getTime() - start;


    start = new Date().getTime();
    for (var i = 0; i < accesses.length; i++)
    {
        if (accesses[i] == "push") {
            arr1.push(-1);
        } else {
            arr1.splice(removes[i], 1);
        }
    }
    arr1_delta_t = new Date().getTime() - start;

    return [arr0_delta_t, arr1_delta_t];
}

console.log(validation_test());
console.log(performance_test());