require "terminal-notifier-guard"

guard :shell do
  watch(/(.*)\.(rb|md|css|js)$/) do |m|
    puts "m: #{m}"
    `ruby app.rb`
  end

  watch(/fixture\/(.*)\.html$/) do |m|
    puts "m: #{m}"
    `ruby app.rb`
  end

  watch(/Gemfile$/) do |m|
    puts "m: #{m}"
    `rm Gemfile.lock && bundle install`
  end
end
