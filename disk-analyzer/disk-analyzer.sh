#!/bin/bash
memory_info=$(df -h / | awk 'NR==2 {print $4 " / " $2}')
echo "Free/Total memory: $memory_info"

used_percentage=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
echo "Percentage: $used_percentage"