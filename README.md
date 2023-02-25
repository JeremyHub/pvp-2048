**Possible Collision System**

The way this system works is that after each 'step' of movement where the blocks move a tile, the game checks every space to see if a block is either on the same space as another block, or has passed a block going in the opposite direction (meaning that those two blocks swapped places). If either is true, the game consideres that a collision, and evaluates it based on the teams/values of the blocks as such:

Same team, same value: One of the blocks has its value doubled while the other is removed.
    
Different team, different value: The block with the lower value is removed.

Same team, different value/different team, same value: Any block that was moving immediately before this collision bounces back a space. No blocks are removed.

After any collision, the remaining blocks no longer move for the rest of the turn.

After this, if there are blocks that can still move spaces, each block moves another tile and the game checks collision again.

**Movement Status**

Part of how this system works is the movement_status variable within blocks. If a block has a movement status of 2, it is currently moving. If it has a movement status of 1, it has completed the current movement step by moving a tile, but can still move additional spaces. If a block has a movement status of 0, it has stopped moving for the turn, and shouldn't move further.

Blocks with a movement status of 0 don't move even if there's a collision. This is how the system makes sure that blocks don't push blocks that have completed their movement out of the way. The movement_status variable is also how the system tells the difference between a block that's done moving for the current movement step, and one that's done moving for the turn.