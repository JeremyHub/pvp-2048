import sys
import pygame

# Initialize pygame
pygame.init()

# Set up the window
WINDOW_SIZE = (640, 640)
screen = pygame.display.set_mode(WINDOW_SIZE)

# Set up the colors
GREEN = (0, 255, 0)
ORANGE = (255, 165, 0)

# Set up the block size and padding
BLOCK_SIZE = 32
PADDING = 2

# Create the grid
grid = []
for row in range(20):
    grid.append([])
    for column in range(20):
        grid[row].append(0)

# Set up the font
font = pygame.font.SysFont(None, 24)

# Set up the buttons
green_button = pygame.Rect(480, 32, 128, 64)
orange_button = pygame.Rect(480, 128, 128, 64)

# Set up the list of blocks
blocks = []

# Main game loop
while True:
    # Handle events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            # print blocks
            to_print = ("")
            for block in blocks:
                if block[0] == 1:
                    color = "green"
                else:
                    color = "orange"
                to_print += ("\"{}\", {}, {}, {}, ".format(color, block[1], block[2], block[3]))
            print(to_print)
            pygame.quit()
            sys.exit()
        elif event.type == pygame.MOUSEBUTTONDOWN:
            # Get the position of the mouse click
            pos = pygame.mouse.get_pos()

            # Check if a button was clicked
            if green_button.collidepoint(pos):
                team = 1
            elif orange_button.collidepoint(pos):
                team = 2
            else:

                # Calculate which block was clicked
                column = pos[0] // (BLOCK_SIZE + PADDING)
                row = pos[1] // (BLOCK_SIZE + PADDING)

                # Get the value of the block from the user
                value = "2"
                should_break = False
                while True and not should_break:
                    for event in pygame.event.get():
                        if event.type == pygame.KEYDOWN:
                            if event.unicode.isdigit():
                                value = event.unicode
                                should_break = True
                                break

                # Draw the text box and text
                text_box_rect = pygame.Rect(column * (BLOCK_SIZE + PADDING), row * (BLOCK_SIZE + PADDING), BLOCK_SIZE, BLOCK_SIZE)
                text_box_rect.inflate_ip(-4, -4)
                pygame.draw.rect(screen, (255, 255, 255), text_box_rect)
                font_surface = font.render(value, True, (0, 0, 0))
                screen.blit(font_surface, (column * (BLOCK_SIZE + PADDING) + BLOCK_SIZE // 2 - font_surface.get_width() // 2,
                                            row * (BLOCK_SIZE + PADDING) + BLOCK_SIZE // 2 - font_surface.get_height() // 2))

                # Update the screen
                pygame.display.update()

                # Update the grid with the new block and its value
                grid[row][column] = team

                # Add the block to the list of blocks with its value
                blocks.append((team, column, row, int(value)))

    # Draw the grid and values on blocks
    for row in range(20):
        for column in range(20):
            color = (255, 255, 255)
            x = column * (BLOCK_SIZE + PADDING)
            y = row * (BLOCK_SIZE + PADDING)
            pygame.draw.rect(screen, color, [x, y, BLOCK_SIZE, BLOCK_SIZE])
    
    # draw the blocks
    for block in blocks:
        if block[0] == 1:
            color = GREEN
        else:
            color = ORANGE
        x = block[1] * (BLOCK_SIZE + PADDING)
        y = block[2] * (BLOCK_SIZE + PADDING)
        pygame.draw.rect(screen, color, [x, y, BLOCK_SIZE, BLOCK_SIZE])
        # draw the value text
        font_surface = font.render(str(block[3]), True, (0, 0, 0))
        screen.blit(font_surface, (x + BLOCK_SIZE // 2 - font_surface.get_width() // 2,
                                    y + BLOCK_SIZE // 2 - font_surface.get_height() // 2))

    # Draw the buttons
    pygame.draw.rect(screen, GREEN, green_button)
    pygame.draw.rect(screen, ORANGE, orange_button)

    # Draw the text on the buttons
    green_text = font.render("Green", True, (0, 0, 0))
    orange_text = font.render("Orange", True, (0, 0, 0))
    screen.blit(green_text, (green_button.x + green_button.width // 2 - green_text.get_width() // 2,
                                green_button.y + green_button.height // 2 - green_text.get_height() // 2))
    screen.blit(orange_text, (orange_button.x + orange_button.width // 2 - orange_text.get_width() // 2,
                                orange_button.y + orange_button.height // 2 - orange_text.get_height() // 2))

    # Update the screen
    pygame.display.update()