require "redcarpet"
require "github/markup"

def path_from(file)
  file = file.sub(/md$/, "html")
  file.sub(/\d{4}\.\d{2}\.\d{2}\-/, "")
end

def content_from(file)
  GitHub::Markup.render(file, File.read(file))
end

def render_index_content(content)
  GitHub::Markup.render("index.markdown", content)
end

def wrapper(content, is_index = false)
  title  = h1_from(content)
  header = interpolate(File.read("fixture/header.html"), is_index, title)
  footer = interpolate(File.read("fixture/footer.html"), is_index)
  "#{header}\n#{content}\n#{footer}"
end

def interpolate(content, is_index, title = "")
  content = content.sub(/{{title}}/, title)
  content.gsub(/{{root}}/, determine_root(is_index))
end

def determine_root(is_index)
  is_index ? "./" : "../"
end

def h1_from(content)
  h1 = content.match("<h1>(.*)</h1>")
  h1 ? h1[1] : "Integralist"
end

def generate_posts(posts)
  posts.each do |file|
    File.open(path_from(file), "w") do |f|
      f.write wrapper(content_from file)
    end
  end
end

def index_markdown
# Careful when generating HTML from Markdown,
# as the slightest space could cause unexpected results
<<-eos
# Integralist

> Tech Lead/Prinicipal Engineer for Frameworks [@BBCNews](http://m.bbc.co.uk/news/)<br>
> Works with distributed & concurrent systems.<br>
> Author of [Pro Vim @Apress](http://www.amazon.co.uk/Pro-Vim-Mark-McDonnell/dp/1484202511/ref=sr_1_1)

## Articles
eos
end

def title_from(content)
  content.match("# (.*)$")[1]
end

def generate_list(posts)
  index_content = index_markdown
  filter = ["posts/about.md"]

  posts.sort.reverse.each do |file|
    index_content += "\n- [#{title_from File.read(file)}](#{path_from file})" unless filter.include? file
  end

  index_content
end

def generate_index(posts)
  File.open("index.html", "w") do |f|
    f.write wrapper(render_index_content(generate_list posts), true)
  end
end

posts = Dir.glob "posts/*.md"

start = Time.now

threads = [:posts, :index].map do |item|
  Thread.new do
    send "generate_#{item}", posts
  end
end
threads.each { |t| t.join }

p "Execution time: #{Time.now - start} seconds"
