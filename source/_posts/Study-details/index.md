---
title: Study details
date: 2023-07-05 18:16:20
tags: study
katex: true
---

# Preface
There are some details out of Examination-oriented education

# Start
## Physics

### The `second` cosmic velocity

> In class, we had learnt the `first` cosmic velocity, Now let's quickly review.
>
> Firstly, we do not consider the effects of rotation. (not consider the effects of the centrifugal force)
>
>so there is $mg=\frac{mv_1^2}{R}$ or $\frac{mv_1^2}{R}=\frac{Gmm'}{R^2}$
>
> and we can get $v_1=\sqrt{gR}=\sqrt{\frac{Gm'}{R}}$

now we begin to analyze how can we get the `second` cosmic velocity

firstly, we know there should be gravity however the distance long.

but we can know that there is a place where the gravity will limits to infinity small and we can suppose there a object comes to the plant, so we can make a formula

> flowing part I will use $E_g$ express the `gravitational potential energy`

$$
\frac{1}{2}mv^2-E_g=0
$$

but what is the $E_G$?
it's very easy, we can image a image, we plus the all $E_G$ of the image to produce the total $E_G$, in this picture, the yellow area is the $E_G$ we what to plus. 

<style>
  .circle {
    width: 300px;
    height: 300px;
    background-color: yellow;
    border-radius: 50%;
    margin: 0 auto;
    position: relative; /* Add this line */
  }
  .circle::before {
    content: "";
    position: absolute; /* Add this line */
    top: 50%; /* Add this line */
    left: 50%; /* Add this line */
    transform: translate(-50%, -50%); /* Add this line */
    width: 5px;
    height: 5px;
    background-color: black;
    border-radius: 50%;
  }
</style>

<div class="circle"></div>

$$
E_G=\int_R^\infty \frac{Gmm'}{R^2}dR=-\frac{Gmm'}{R}\bigg|_R^\infty=\frac{Gmm'}{R}
$$

and then there is the result.
$$
v_2=\sqrt{\frac{2Gm'}{R}}=\sqrt{v_1}
$$

now, you can also try to get the $v_3, v_4,\cdots, v_n$
