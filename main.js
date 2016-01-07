log = console.log

function node(item)
{
    this.item = item;
    this.next = null;
}

function sorted_list(arr)
{
    this.head = null;

    this.insert = function(item)
    {
        var nd = new node(item);
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
                prv = tmp
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

function efficient_array()
{
    var self = this;

    this.array = [];
    this.length = 0;

    var REMOVE_K = 10;
    var remove_count = 0;
    var removed = new sorted_list();
    this.removed = removed;

    var is_int = function(index) {return true;};

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
        removed = new sorted_list();
        self.array = self.array.filter(function(elem)
        {
            return elem !== undefined;
        });
        self.length = self.array.length;
    };

    var wrap = function(fn0, fn1)
    {
        return function(i)
        {
            return fn0(fn1(i));
        };
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

        if (remove_count == REMOVE_K) {
            flatten();
        }
        remove_count += 1;
        return result;

        // var len = this.length;
        // var self = this;
        // var adjust = function(i)
        // {
        //     console.log(i);
        //     var start = index;
        //     var end = len;
        //     if (i >= start && i < end) {
        //         return i + 1;
        //     } else if (i >= end) {
        //         throw new Error("Array index: " + i + " out of bounds");
        //     }
        //     return i;
        // }
        // translate = wrap(translate, adjust);
    }
}

function init_random_arrays(size)
{
    arr0 = new efficient_array();
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
            arr0.push(num)
            arr1.push(num)
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

function performance_test(arr0, arr1)
{
    k = 10000;
    var tmp = init_random_arrays(k);
    var arr0 = tmp[0];
    var arr1 = tmp[1];

    var accesses = [];
    var removes = [];
    var length = k;

    for (var i = 0; i < 100000; i++)
    {
        if (Math.random() > 0.5) {
            accesses.push("push")
            k += 1;
        } else {
            accesses.push("remove")
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
            arr0.remove(removes[i])
        }
    }
    arr0_delta_t = new Date().getTime() - start;


    start = new Date().getTime();
    for (var i = 0; i < accesses.length; i++)
    {
        if (accesses[i] == "push") {
            arr1.push(-1);
        } else {
            arr1.splice(removes[i], 1)
        }
    }
    arr1_delta_t = new Date().getTime() - start;

    return [arr0_delta_t, arr1_delta_t];
}

console.log(validation_test());
console.log(performance_test());